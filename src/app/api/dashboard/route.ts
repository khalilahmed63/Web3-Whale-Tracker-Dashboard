import { NextResponse } from "next/server";
import { TRACKED_WALLETS } from "@/lib/config/whales";
import { pollWhaleTransactions } from "@/lib/ingestion/poller";
import { ingestionState } from "@/lib/ingestion/store";
import type { SupportedChain } from "@/types/transaction";

type FlowBucket = { bucketStart: string; inflowUsd: number; outflowUsd: number };

function toHourBucket(timestamp: string): string {
  const date = new Date(timestamp);
  date.setMinutes(0, 0, 0);
  return date.toISOString();
}

function buildFlowSeries(
  transactions: typeof ingestionState.transactions,
  hours = 12,
): FlowBucket[] {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  const buckets = new Map<string, FlowBucket>();

  for (let i = hours - 1; i >= 0; i -= 1) {
    const bucketDate = new Date(now.getTime() - i * 60 * 60 * 1000);
    const key = bucketDate.toISOString();
    buckets.set(key, { bucketStart: key, inflowUsd: 0, outflowUsd: 0 });
  }

  for (const tx of transactions) {
    const key = toHourBucket(tx.timestamp);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    if (tx.direction === "inflow") bucket.inflowUsd += tx.usdValue;
    else bucket.outflowUsd += tx.usdValue;
  }

  return Array.from(buckets.values());
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chain = searchParams.get("chain") as SupportedChain | "all" | null;
  const pollResult = await pollWhaleTransactions();

  const transactions =
    chain && chain !== "all"
      ? ingestionState.transactions.filter((tx) => tx.chain === chain)
      : ingestionState.transactions;
  const alerts =
    chain && chain !== "all"
      ? ingestionState.alerts.filter((alert) => alert.chain === chain)
      : ingestionState.alerts;

  const inflowUsd24h = transactions
    .filter((tx) => tx.direction === "inflow")
    .reduce((sum, tx) => sum + tx.usdValue, 0);
  const outflowUsd24h = transactions
    .filter((tx) => tx.direction === "outflow")
    .reduce((sum, tx) => sum + tx.usdValue, 0);
  const flowSeries = buildFlowSeries(transactions);

  const walletMetricsSource =
    TRACKED_WALLETS.length > 0
      ? TRACKED_WALLETS.map((wallet) => ({
          label: wallet.label,
          address: wallet.address.toLowerCase(),
          chains: wallet.chains,
        }))
      : Array.from(new Set(transactions.map((tx) => tx.walletAddress.toLowerCase())))
          .slice(0, 20)
          .map((address, index) => ({
            label: `Whale ${index + 1}`,
            address,
            chains: ["ethereum", "base", "polygon"] as const,
          }));

  const walletMetrics = walletMetricsSource.map((wallet) => {
    const walletTx = transactions.filter((tx) => tx.walletAddress.toLowerCase() === wallet.address.toLowerCase());
    const inflowUsd = walletTx.filter((tx) => tx.direction === "inflow").reduce((sum, tx) => sum + tx.usdValue, 0);
    const outflowUsd = walletTx.filter((tx) => tx.direction === "outflow").reduce((sum, tx) => sum + tx.usdValue, 0);
    const largeTxCount = walletTx.filter((tx) => tx.isLarge).length;

    return {
      label: wallet.label,
      address: wallet.address,
      chains: [...wallet.chains],
      inflowUsd24h: inflowUsd,
      outflowUsd24h: outflowUsd,
      netFlowUsd24h: inflowUsd - outflowUsd,
      largeTxCount24h: largeTxCount,
      lastActiveAt: walletTx[0]?.timestamp ?? null,
    };
  });

  return NextResponse.json({
    data: {
      summary: {
        totalWhales: walletMetrics.length,
        inflowUsd24h,
        outflowUsd24h,
        largeTxCount24h: transactions.filter((tx) => tx.isLarge).length,
      },
      flowSeries,
      walletMetrics,
      recentTransactions: transactions.slice(0, 100),
      recentAlerts: alerts.slice(0, 30),
    },
    meta: {
      lastPollAt: ingestionState.lastPollAt,
      pollStatus: pollResult.reason,
      pricingCoverage: ingestionState.pricingCoverage,
    },
  });
}
