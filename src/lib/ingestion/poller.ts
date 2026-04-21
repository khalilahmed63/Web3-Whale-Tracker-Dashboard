import {
  LARGE_TX_USD_THRESHOLD,
  MAX_STORED_ALERTS,
  MAX_STORED_TRANSACTIONS,
  OUTFLOW_SPIKE_USD_THRESHOLD,
  POLL_INTERVAL_MS,
} from "@/lib/config/thresholds";
import { SUPPORTED_CHAINS } from "@/lib/config/chains";
import { TRACKED_WALLETS } from "@/lib/config/whales";
import { ingestionState } from "@/lib/ingestion/store";
import { fetchWalletTransfers } from "@/lib/providers/alchemy";
import { getUsdPriceBySymbol, hasPriceMappingForSymbol } from "@/lib/providers/pricing";
import type { UiAlert } from "@/types/alert";
import type { SupportedChain, WhaleTransaction } from "@/types/transaction";

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function hexToNumber(value?: string): number {
  if (!value) return 0;
  const parsed = Number.parseInt(value, 16);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeTransfer(
  chain: SupportedChain,
  walletAddress: string,
  direction: "inflow" | "outflow",
  usdPrice: number,
  transfer: {
    hash?: string;
    from?: string;
    to?: string;
    value?: number;
    asset?: string;
    uniqueId?: string;
    blockNum?: string;
    logIndex?: string;
    metadata?: { blockTimestamp?: string };
  },
): WhaleTransaction | null {
  const hash = transfer.hash ?? "";
  if (!hash) return null;

  const from = (transfer.from ?? "").toLowerCase();
  const to = (transfer.to ?? "").toLowerCase();
  const amount = toNumber(transfer.value);
  const usdValue = amount * usdPrice;
  const blockNumber = hexToNumber(transfer.blockNum);
  const logIndex = transfer.logIndex ? Number(transfer.logIndex) : undefined;
  const id = `${chain}:${hash}:${walletAddress.toLowerCase()}:${transfer.uniqueId ?? logIndex ?? 0}`;

  return {
    id,
    chain,
    hash,
    blockNumber,
    logIndex,
    walletAddress,
    counterparty: direction === "inflow" ? from : to,
    tokenSymbol: transfer.asset ?? "UNKNOWN",
    amount,
    usdValue,
    direction,
    isLarge: usdValue >= LARGE_TX_USD_THRESHOLD,
    timestamp: transfer.metadata?.blockTimestamp ?? new Date().toISOString(),
  };
}

function normalizeGlobalTransfer(
  chain: SupportedChain,
  usdPrice: number,
  transfer: Parameters<typeof normalizeTransfer>[4],
): WhaleTransaction[] {
  const from = (transfer.from ?? "").toLowerCase();
  const to = (transfer.to ?? "").toLowerCase();
  const results: WhaleTransaction[] = [];
  if (from) {
    const outflow = normalizeTransfer(chain, from, "outflow", usdPrice, transfer);
    if (outflow) results.push(outflow);
  }
  if (to) {
    const inflow = normalizeTransfer(chain, to, "inflow", usdPrice, transfer);
    if (inflow) results.push(inflow);
  }
  return results;
}

function buildAlerts(transactions: WhaleTransaction[]): UiAlert[] {
  const alerts: UiAlert[] = [];

  for (const tx of transactions) {
    if (tx.usdValue >= LARGE_TX_USD_THRESHOLD) {
      alerts.push({
        id: `${tx.id}-large`,
        chain: tx.chain,
        message: `Large ${tx.direction} detected on ${tx.chain}: $${Math.round(tx.usdValue).toLocaleString()} ${tx.tokenSymbol}`,
        severity: tx.direction === "outflow" ? "warning" : "info",
        createdAt: tx.timestamp,
      });
    }

    if (tx.direction === "outflow" && tx.usdValue >= OUTFLOW_SPIKE_USD_THRESHOLD) {
      alerts.push({
        id: `${tx.id}-spike`,
        chain: tx.chain,
        message: `Outflow spike on ${tx.chain}: $${Math.round(tx.usdValue).toLocaleString()} ${tx.tokenSymbol}`,
        severity: "critical",
        createdAt: tx.timestamp,
      });
    }
  }

  return alerts;
}

function dedupeAlerts(alerts: UiAlert[]): UiAlert[] {
  const deduped = new Map<string, UiAlert>();
  for (const alert of alerts) {
    deduped.set(alert.id, alert);
  }
  return Array.from(deduped.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function pollWhaleTransactions(force = false) {
  const now = Date.now();
  const apiKey = process.env.ALCHEMY_API_KEY;

  if (!apiKey) {
    return { ok: false, reason: "Missing ALCHEMY_API_KEY" as const };
  }

  if (ingestionState.isPolling) {
    return { ok: true as const, reason: "poll_in_progress" as const };
  }

  if (!force && now - ingestionState.lastPollAt < POLL_INTERVAL_MS) {
    return { ok: true, reason: "rate_limited" as const };
  }

  ingestionState.isPolling = true;
  const normalized: WhaleTransaction[] = [];
  const unmappedSymbols = new Set<string>();

  try {
    if (TRACKED_WALLETS.length > 0) {
      for (const wallet of TRACKED_WALLETS) {
        for (const chain of wallet.chains) {
          const fromBlockHex = `0x${Math.max(ingestionState.cursorByChain[chain] - 6, 0).toString(16)}`;
          const transfers = await fetchWalletTransfers(chain, apiKey, fromBlockHex, wallet.address);
          for (const transfer of transfers) {
            const symbol = transfer.asset ?? "UNKNOWN";
            if (!hasPriceMappingForSymbol(symbol)) unmappedSymbols.add(symbol.toUpperCase());
            const usdPrice = await getUsdPriceBySymbol(symbol);
            const direction = (transfer.to ?? "").toLowerCase() === wallet.address.toLowerCase() ? "inflow" : "outflow";
            const tx = normalizeTransfer(chain, wallet.address, direction, usdPrice, transfer);
            if (!tx || ingestionState.seenTransactionIds[tx.id]) continue;
            ingestionState.seenTransactionIds[tx.id] = now;
            normalized.push(tx);
            if (tx.blockNumber > ingestionState.cursorByChain[chain]) ingestionState.cursorByChain[chain] = tx.blockNumber;
          }
        }
      }
    } else {
      for (const chain of SUPPORTED_CHAINS) {
        const fromBlockHex = `0x${Math.max(ingestionState.cursorByChain[chain] - 6, 0).toString(16)}`;
        const transfers = await fetchWalletTransfers(chain, apiKey, fromBlockHex);
        for (const transfer of transfers) {
          const symbol = transfer.asset ?? "UNKNOWN";
          if (!hasPriceMappingForSymbol(symbol)) unmappedSymbols.add(symbol.toUpperCase());
          const usdPrice = await getUsdPriceBySymbol(symbol);
          const txs = normalizeGlobalTransfer(chain, usdPrice, transfer);
          for (const tx of txs) {
            if (ingestionState.seenTransactionIds[tx.id]) continue;
            ingestionState.seenTransactionIds[tx.id] = now;
            normalized.push(tx);
            if (tx.blockNumber > ingestionState.cursorByChain[chain]) ingestionState.cursorByChain[chain] = tx.blockNumber;
          }
        }
      }
    }

    const transactions = [...normalized, ...ingestionState.transactions]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, MAX_STORED_TRANSACTIONS);

    const newAlerts = buildAlerts(normalized);
    ingestionState.transactions = transactions;
    ingestionState.alerts = dedupeAlerts([...newAlerts, ...ingestionState.alerts]).slice(
      0,
      MAX_STORED_ALERTS,
    );
    ingestionState.pricingCoverage = {
      totalTransfers: transactions.length,
      pricedTransfers: transactions.filter((tx) => tx.usdValue > 0).length,
      unmappedSymbols: Array.from(unmappedSymbols).sort(),
    };
    ingestionState.lastPollAt = now;

    const staleMs = 24 * 60 * 60 * 1000;
    for (const [id, seenAt] of Object.entries(ingestionState.seenTransactionIds)) {
      if (now - seenAt > staleMs) {
        delete ingestionState.seenTransactionIds[id];
      }
    }

    return {
      ok: true as const,
      reason: TRACKED_WALLETS.length > 0 ? ("polled" as const) : ("polled_global" as const),
    };
  } finally {
    ingestionState.isPolling = false;
  }
}
