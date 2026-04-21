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
  const [isLoading, setIsLoading] = useState(true);
  const [compactMode, setCompactMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("dashboard-compact-mode") === "true";
  });

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 15_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("dashboard-compact-mode", String(compactMode));
    }
  }, [compactMode]);

  useEffect(() => {
    let active = true;

    async function loadData(showLoader = false) {
      if (showLoader) setIsLoading(true);
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
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadData(true);
    const interval = setInterval(() => loadData(false), 15_000);
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
  const [isReady, setIsReady] = useState(false);
  const visibleToasts = useMemo(
    () => toasts.filter((toast) => !dismissedToastIds.includes(toast.id)),
    [toasts, dismissedToastIds],
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const revealClass = () =>
    `transform-gpu transition-all duration-700 ease-out ${
      isReady ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
    }`;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#1f2937,#020617_50%,#020617_85%)] p-4 text-zinc-100 sm:p-8">
      <ToastStack
        toasts={visibleToasts}
        onDismiss={(id) => setDismissedToastIds((prev) => [...prev, id])}
      />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <div className={revealClass()} style={{ transitionDelay: "0ms" }}>
          <div className="flex flex-col gap-3 rounded-3xl border border-zinc-700/70 bg-zinc-900/75 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="bg-linear-to-r from-white to-zinc-300 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-4xl">
              Web3 Whale Tracker Dashboard
            </h1>
            <p className="mt-2 text-sm text-zinc-300">
              Real-time intelligence for high-value wallet movements across major EVM chains.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-xs text-zinc-300 shadow-lg shadow-black/20">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">Poll status</span>
              <span className="relative inline-flex h-2.5 w-2.5">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                    meta.pollStatus === "polled" ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
                <span
                  className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                    meta.pollStatus === "polled" ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
              </span>
              <span className={`rounded px-2 py-0.5 font-medium ${pollStatusStyle}`}>
                {meta.pollStatus.replaceAll("_", " ")}
              </span>
            </div>
            <p className="mt-1">
              Last updated:{" "}
              {meta.lastPollAt > 0 ? new Date(meta.lastPollAt).toLocaleTimeString() : "Waiting for first poll"}
            </p>
            <button
              type="button"
              onClick={() => setCompactMode((prev) => !prev)}
              className={`mt-2 rounded-lg border px-2 py-1 text-[11px] font-medium transition focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
                compactMode
                  ? "border-violet-500 bg-violet-500/20 text-violet-200"
                  : "border-zinc-700 text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              {compactMode ? "Compact: On" : "Compact: Off"}
            </button>
          </div>
        </div>
        </div>

        <div className={revealClass()} style={{ transitionDelay: "80ms" }}>
          <ChainFilter selectedChain={chain} onChange={setChain} />
        </div>

        <div className={revealClass()} style={{ transitionDelay: "140ms" }}>
          <WhaleSummaryCards
            totalWhales={summary.totalWhales}
            totalInflowUsd={summary.inflowUsd24h}
            totalOutflowUsd={summary.outflowUsd24h}
            netFlowUsd24h={summary.inflowUsd24h - summary.outflowUsd24h}
            largeTxCount24h={summary.largeTxCount24h}
            isLoading={isLoading}
          />
        </div>

        <div className={revealClass()} style={{ transitionDelay: "200ms" }}>
          <AlertBanner alert={alerts[0] ?? null} />
        </div>
        <div className={revealClass()} style={{ transitionDelay: "260ms" }}>
          <FlowChart data={flowSeries} isDark isLoading={isLoading} />
        </div>
        <div className={revealClass()} style={{ transitionDelay: "320ms" }}>
          <TransactionTable transactions={filteredTransactions} compact={compactMode} isLoading={isLoading} />
        </div>
        <div className={`grid grid-cols-1 gap-6 lg:grid-cols-2 ${revealClass()}`} style={{ transitionDelay: "380ms" }}>
          <div>
            <ActivityFeed alerts={alerts} nowMs={nowMs} compact={compactMode} isLoading={isLoading} />
          </div>
          <div>
            <WalletDetailPanel metrics={walletMetrics} compact={compactMode} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </main>
  );
}
