import type { SupportedChain } from "@/types/transaction";
import { useMemo, useState } from "react";
import { ChainBadge } from "@/components/dashboard/ChainIcon";

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

interface WalletDetailPanelProps {
  metrics: WalletMetric[];
  compact?: boolean;
}

export function WalletDetailPanel({ metrics, compact = false }: WalletDetailPanelProps) {
  const PAGE_SIZE = 4;
  const [page, setPage] = useState(1);
  const sortedMetrics = useMemo(
    () => [...metrics].sort((a, b) => Math.abs(b.netFlowUsd24h) - Math.abs(a.netFlowUsd24h)),
    [metrics],
  );
  const totalPages = Math.max(1, Math.ceil(sortedMetrics.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedMetrics = useMemo(
    () => sortedMetrics.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [sortedMetrics, currentPage],
  );
  const activeWallets = sortedMetrics.filter((wallet) => wallet.lastActiveAt).length;

  return (
    <div className={`flex ${compact ? "h-[520px]" : "h-[560px]"} flex-col rounded-2xl border border-zinc-700 bg-zinc-900 p-5 shadow-xl shadow-black/25`}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-100">Per-whale metrics (24h)</h2>
        <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-300">
          {activeWallets}/{metrics.length} active
        </span>
      </div>
      <div className={`mt-3 flex-1 overflow-y-auto pr-1 ${compact ? "space-y-2" : "space-y-3"}`}>
        {metrics.length === 0 ? (
          <p className="text-sm text-zinc-400">No wallet metrics yet.</p>
        ) : null}
        {pagedMetrics.map((wallet) => (
          <div
            key={wallet.address}
            className={`rounded-xl border border-zinc-700 bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-800 transition hover:border-zinc-600 hover:shadow-lg hover:shadow-black/20 ${compact ? "p-3" : "p-3.5"}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-100">{wallet.label}</p>
              <div className="flex flex-wrap items-center justify-end gap-1">
                {wallet.chains.map((chain) => (
                  <ChainBadge key={`${wallet.address}-${chain}`} chain={chain} size="md" />
                ))}
              </div>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <p className="rounded-md bg-emerald-900/30 px-2 py-1 text-emerald-300">
                Inflow: ${Math.round(wallet.inflowUsd24h).toLocaleString()}
              </p>
              <p className="rounded-md bg-rose-900/30 px-2 py-1 text-rose-300">
                Outflow: ${Math.round(wallet.outflowUsd24h).toLocaleString()}
              </p>
              <p
                className={`rounded-md px-2 py-1 ${
                  wallet.netFlowUsd24h >= 0
                    ? "bg-emerald-900/30 text-emerald-300"
                    : "bg-rose-900/30 text-rose-300"
                }`}
              >
                Net: ${Math.round(wallet.netFlowUsd24h).toLocaleString()}
              </p>
              <p className="rounded-md bg-amber-900/30 px-2 py-1 text-amber-300">
                Large tx: {wallet.largeTxCount24h}
              </p>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              Last active: {wallet.lastActiveAt ? new Date(wallet.lastActiveAt).toLocaleString() : "No activity"}
            </p>
          </div>
        ))}
      </div>
      {metrics.length > 0 ? (
        <div className="mt-3 flex items-center justify-between border-t border-zinc-700 pt-3 text-xs">
          <p className="text-zinc-400">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, metrics.length)} of{" "}
            {metrics.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-zinc-700 px-2 py-1 text-zinc-200 transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-zinc-400">
              {currentPage}/{totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-md border border-zinc-700 px-2 py-1 text-zinc-200 transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
