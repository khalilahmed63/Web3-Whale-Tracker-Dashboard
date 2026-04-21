import type { WhaleTransaction } from "@/types/transaction";
import { useMemo, useState } from "react";

interface TransactionTableProps {
  transactions: WhaleTransaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const PAGE_SIZE = 12;
  const [page, setPage] = useState(1);

  function formatChain(chain: WhaleTransaction["chain"]) {
    if (chain === "ethereum") return "Ethereum";
    if (chain === "polygon") return "Polygon";
    return "Base";
  }

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
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-900">Recent whale transactions</h2>
        <p className="mt-1 text-xs text-zinc-500">Latest normalized inflow/outflow movements across chains.</p>
      </div>
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-600">
          <tr>
            <th className="px-4 py-3">Time</th>
            <th className="px-4 py-3">Chain</th>
            <th className="px-4 py-3">Wallet</th>
            <th className="px-4 py-3">Direction</th>
            <th className="px-4 py-3">Token</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">USD value</th>
          </tr>
        </thead>
        <tbody>
          {pagedTransactions.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-sm text-zinc-500">
                No live transfers yet. Add tracked wallets and wait for the next poll.
              </td>
            </tr>
          ) : null}
          {pagedTransactions.map((tx) => (
            <tr key={tx.id} className={`border-t border-zinc-100 ${tx.isLarge ? "bg-amber-50/60" : "hover:bg-zinc-50"}`}>
              <td className="px-4 py-3 text-zinc-700">
                <div className="flex flex-col">
                  <span>{new Date(tx.timestamp).toLocaleTimeString()}</span>
                  <span className="text-xs text-zinc-500">{new Date(tx.timestamp).toLocaleDateString()}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-zinc-700">
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium">
                  {formatChain(tx.chain)}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-700">
                {tx.walletAddress.slice(0, 6)}...{tx.walletAddress.slice(-4)}
              </td>
              <td
                className={`px-4 py-3 font-medium ${
                  tx.direction === "inflow" ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {tx.direction === "inflow" ? "Inflow" : "Outflow"}
              </td>
              <td className="px-4 py-3 font-medium text-zinc-700">{tx.tokenSymbol}</td>
              <td className="px-4 py-3 text-zinc-700">{tx.amount.toLocaleString()}</td>
              <td className="px-4 py-3 font-semibold text-zinc-900">
                ${tx.usdValue.toLocaleString()}
                {tx.isLarge ? (
                  <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
                    large
                  </span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 text-sm">
        <p className="text-zinc-500">
          Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, sortedTransactions.length)} of{" "}
          {sortedTransactions.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs text-zinc-600">
            Page {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
