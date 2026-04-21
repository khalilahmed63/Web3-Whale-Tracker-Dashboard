"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { ChainFilter } from "@/components/dashboard/ChainFilter";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { ToastStack } from "@/components/dashboard/ToastStack";
import { WalletDetailPanel } from "@/components/dashboard/WalletDetailPanel";
import { WhaleSummaryCards } from "@/components/dashboard/WhaleSummaryCards";
import { POLL_INTERVAL_MS } from "@/lib/config/thresholds";
import type { UiAlert } from "@/types/alert";
import type { SupportedChain, WhaleTransaction } from "@/types/transaction";

const FlowChart = dynamic(
  () => import("@/components/dashboard/FlowChart").then((mod) => mod.FlowChart),
  { ssr: false },
);

interface DashboardSummary {
  totalWhales: number;
  inflowUsd24h: number;
  outflowUsd24h: number;
  largeTxCount24h: number;
}

interface FlowSeriesPoint {
  bucketStart: string;
  inflowUsd: number;
  outflowUsd: number;
}

interface WalletMetric {
  label: string;
  address: string;
  chains: SupportedChain[];
  inflowUsd24h: number;
  outflowUsd24h: number;
  netFlowUsd24h: number;
  largeTxCount24h: number;
  lastActiveAt: string | null;
}

interface DashboardMeta {
  lastPollAt: number;
  pollStatus: "polled" | "rate_limited" | "poll_in_progress" | string;
}

export default function DashboardPage() {
  const [chain, setChain] = useState<SupportedChain | "all">("all");
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([]);
  const [alerts, setAlerts] = useState<UiAlert[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>({
    totalWhales: 0,
    inflowUsd24h: 0,
    outflowUsd24h: 0,
    largeTxCount24h: 0,
  });
  const [flowSeries, setFlowSeries] = useState<FlowSeriesPoint[]>([]);
  const [walletMetrics, setWalletMetrics] = useState<WalletMetric[]>([]);
  const [meta, setMeta] = useState<DashboardMeta>({
    lastPollAt: 0,
    pollStatus: "rate_limited",
  });
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pricingWarning, setPricingWarning] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 15_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const dashboardRes = await fetch(`/api/dashboard?chain=${chain}`, { cache: "no-store" });
        const dashboardJson = (await dashboardRes.json()) as {
          data?: {
            summary?: DashboardSummary;
            flowSeries?: FlowSeriesPoint[];
            walletMetrics?: WalletMetric[];
            recentTransactions?: WhaleTransaction[];
            recentAlerts?: UiAlert[];
          };
          meta?: {
            lastPollAt?: number;
            pollStatus?: DashboardMeta["pollStatus"];
            pricingCoverage?: {
              totalTransfers: number;
              pricedTransfers: number;
              unmappedSymbols: string[];
            };
          };
        };

        if (!active) return;
        setSummary(
          dashboardJson.data?.summary ?? {
            totalWhales: 0,
            inflowUsd24h: 0,
            outflowUsd24h: 0,
            largeTxCount24h: 0,
          },
        );
        setFlowSeries(dashboardJson.data?.flowSeries ?? []);
        setWalletMetrics(dashboardJson.data?.walletMetrics ?? []);
        setTransactions(dashboardJson.data?.recentTransactions ?? []);
        setAlerts(dashboardJson.data?.recentAlerts ?? []);
        setMeta({
          lastPollAt: dashboardJson.meta?.lastPollAt ?? 0,
          pollStatus: dashboardJson.meta?.pollStatus ?? "rate_limited",
        });
        const coverage = dashboardJson.meta?.pricingCoverage;
        if (coverage && coverage.totalTransfers > coverage.pricedTransfers) {
          const missing = coverage.unmappedSymbols.slice(0, 5).join(", ");
          setPricingWarning(
            `USD estimates are partial: ${coverage.pricedTransfers}/${coverage.totalTransfers} transfers priced. Unmapped symbols: ${missing || "Unknown"}.`,
          );
        } else {
          setPricingWarning(null);
        }
        setErrorMessage(null);
      } catch {
        if (!active) return;
        setErrorMessage(
          "Could not load live data. Add ALCHEMY_API_KEY in .env.local and refresh.",
        );
        setPricingWarning(null);
      }
    }

    loadData();
    const interval = setInterval(loadData, 15_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [chain]);

  const filteredTransactions = useMemo(() => transactions, [transactions]);
  const isDataStale =
    meta.lastPollAt > 0 && nowMs - meta.lastPollAt > POLL_INTERVAL_MS * 2;
  const pollStatusStyle =
    meta.pollStatus === "polled"
      ? "bg-emerald-100 text-emerald-700"
      : meta.pollStatus === "poll_in_progress"
        ? "bg-amber-100 text-amber-700"
        : "bg-zinc-200 text-zinc-700";
  const toasts = useMemo(() => {
    const items: Array<{ id: string; title: string; message: string; tone: "info" | "warning" | "critical" }> = [];
    if (errorMessage) {
      items.push({
        id: "error-message",
        title: "Connection Issue",
        message: errorMessage,
        tone: "critical",
      });
    }
    if (pricingWarning) {
      items.push({
        id: "pricing-warning",
        title: "Pricing Coverage",
        message: pricingWarning,
        tone: "warning",
      });
    }
    if (isDataStale) {
      items.push({
        id: "stale-data",
        title: "Delayed Polling",
        message: `Last successful update was at ${new Date(meta.lastPollAt).toLocaleTimeString()}.`,
        tone: "warning",
      });
    }
    return items;
  }, [errorMessage, pricingWarning, isDataStale, meta.lastPollAt]);
  const [dismissedToastIds, setDismissedToastIds] = useState<string[]>([]);
  const visibleToasts = useMemo(
    () => toasts.filter((toast) => !dismissedToastIds.includes(toast.id)),
    [toasts, dismissedToastIds],
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-100 via-zinc-50 to-white p-6 sm:p-10">
      <ToastStack
        toasts={visibleToasts}
        onDismiss={(id) => setDismissedToastIds((prev) => [...prev, id])}
      />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Web3 Whale Tracker Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Monitor tracked whales and flag large inflows and outflows.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Poll status</span>
              <span className={`rounded px-2 py-0.5 font-medium ${pollStatusStyle}`}>
                {meta.pollStatus.replaceAll("_", " ")}
              </span>
            </div>
            <p className="mt-1">
              Last updated:{" "}
              {meta.lastPollAt > 0 ? new Date(meta.lastPollAt).toLocaleTimeString() : "Waiting for first poll"}
            </p>
          </div>
        </div>

        <ChainFilter selectedChain={chain} onChange={setChain} />

        <WhaleSummaryCards
          totalWhales={summary.totalWhales}
          totalInflowUsd={summary.inflowUsd24h}
          totalOutflowUsd={summary.outflowUsd24h}
          netFlowUsd24h={summary.inflowUsd24h - summary.outflowUsd24h}
          largeTxCount24h={summary.largeTxCount24h}
        />

        <AlertBanner alert={alerts[0] ?? null} />
        <FlowChart data={flowSeries} />
        <TransactionTable transactions={filteredTransactions} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ActivityFeed alerts={alerts} />
          <WalletDetailPanel metrics={walletMetrics} />
        </div>
      </div>
    </main>
  );
}
