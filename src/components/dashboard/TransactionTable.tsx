import type { WhaleTransaction } from "@/types/transaction";
import { useMemo, useState } from "react";
import { ChainBadge } from "@/components/dashboard/ChainIcon";
import { SpotlightPanel } from "@/components/dashboard/SpotlightPanel";

interface TransactionTableProps {
  transactions: WhaleTransaction[];
  compact?: boolean;
  isLoading?: boolean;
}

export function TransactionTable({ transactions, compact = false, isLoading = false }: TransactionTableProps) {
  const PAGE_SIZE = 12;
  const [page, setPage] = useState(1);

  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => b.usdValue - a.usdValue),
    [transactions],
  );
  const totalPages = Math.max(1, Math.ceil(sortedTransactions.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedTransactions = useMemo(
    () =>
      sortedTransactions.slice(
        (currentPage - 1) * PAGE_SIZE,
        (currentPage - 1) * PAGE_SIZE + PAGE_SIZE,
      ),
    [sortedTransactions, currentPage],
  );

  return (
    <SpotlightPanel
      className="overflow-x-auto rounded-2xl border border-zinc-700 bg-zinc-900 shadow-xl shadow-black/25 transition duration-300 hover:border-zinc-600"
      glowColor="rgba(59,130,246,0.12)"
      glowSizePx={360}
    >
      <div className={`border-b border-zinc-700 ${compact ? "px-4 py-3" : "px-5 py-4"}`}>
        <h2 className="text-sm font-semibold text-zinc-100">Recent whale transactions</h2>
        <p className="mt-1 text-xs text-zinc-400">Latest normalized inflow/outflow movements across chains.</p>
      </div>
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-800/60 text-left text-xs uppercase tracking-wide text-zinc-300">
          <tr>
            <th className={compact ? "px-3 py-2" : "px-4 py-3"}>Time</th>
            <th className={compact ? "px-3 py-2" : "px-4 py-3"}>Chain</th>
            <th className={compact ? "px-3 py-2" : "px-4 py-3"}>Wallet</th>
            <th className={compact ? "px-3 py-2" : "px-4 py-3"}>Direction</th>
            <th className={compact ? "px-3 py-2" : "px-4 py-3"}>Token</th>
            <th className={compact ? "px-3 py-2" : "px-4 py-3"}>Amount</th>
            <th className={compact ? "px-3 py-2" : "px-4 py-3"}>USD value</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <tr key={`loading-${index}`} className="border-t border-zinc-800">
                <td colSpan={7} className={compact ? "px-3 py-2.5" : "px-4 py-3"}>
                  <div className="h-6 animate-pulse rounded bg-zinc-800/90" />
                </td>
              </tr>
            ))
          ) : pagedTransactions.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-sm text-zinc-400">
                <div className="space-y-1">
                  <p className="text-lg">🐋</p>
                  <p>No live transfers yet. Whale-sized activity will populate here automatically.</p>
                </div>
              </td>
            </tr>
          ) : null}
          {pagedTransactions.map((tx) => (
            <tr
              key={tx.id}
              className={`border-t border-zinc-800 transition ${tx.isLarge ? "bg-amber-900/20" : "hover:bg-zinc-800/60"}`}
            >
              <td className={compact ? "px-3 py-2 text-zinc-200" : "px-4 py-3 text-zinc-200"}>
                <div className="flex flex-col">
                  <span>{new Date(tx.timestamp).toLocaleTimeString()}</span>
                  <span className="text-xs text-zinc-400">{new Date(tx.timestamp).toLocaleDateString()}</span>
                </div>
              </td>
              <td className={compact ? "px-3 py-2 text-zinc-200" : "px-4 py-3 text-zinc-200"}>
                <ChainBadge chain={tx.chain} size="sm" />
              </td>
              <td className={compact ? "px-3 py-2 font-mono text-xs text-zinc-300" : "px-4 py-3 font-mono text-xs text-zinc-300"}>
                {tx.walletAddress.slice(0, 6)}...{tx.walletAddress.slice(-4)}
              </td>
              <td
                className={`${compact ? "px-3 py-2" : "px-4 py-3"} font-medium ${
                  tx.direction === "inflow" ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {tx.direction === "inflow" ? "Inflow" : "Outflow"}
              </td>
              <td className={compact ? "px-3 py-2 font-medium text-zinc-200" : "px-4 py-3 font-medium text-zinc-200"}>{tx.tokenSymbol}</td>
              <td className={compact ? "px-3 py-2 text-zinc-300" : "px-4 py-3 text-zinc-300"}>{tx.amount.toLocaleString()}</td>
              <td className={compact ? "px-3 py-2 font-semibold text-zinc-100" : "px-4 py-3 font-semibold text-zinc-100"}>
                ${tx.usdValue.toLocaleString()}
                {tx.isLarge ? (
                  <span className="ml-2 rounded bg-amber-900/40 px-1.5 py-0.5 text-xs text-amber-300">
                    large
                  </span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={`flex items-center justify-between border-t border-zinc-700 text-sm ${compact ? "px-4 py-2.5" : "px-5 py-3"}`}>
        <p className="text-zinc-400">
          {isLoading
            ? "Loading latest transfers..."
            : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}-${Math.min(currentPage * PAGE_SIZE, sortedTransactions.length)} of ${sortedTransactions.length}`}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={isLoading || currentPage === 1}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs text-zinc-400">
            Page {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={isLoading || currentPage === totalPages}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </SpotlightPanel>
  );
}
