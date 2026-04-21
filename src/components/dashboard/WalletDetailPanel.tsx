import type { SupportedChain } from "@/types/transaction";

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
}

export function WalletDetailPanel({ metrics }: WalletDetailPanelProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-zinc-900">Per-whale metrics (24h)</h2>
      <div className="mt-3 space-y-3">
        {metrics.length === 0 ? (
          <p className="text-sm text-zinc-500">No wallet metrics yet.</p>
        ) : null}
        {metrics.map((wallet) => (
          <div key={wallet.address} className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-800">{wallet.label}</p>
              <p className="text-xs text-zinc-500">{wallet.chains.join(" · ")}</p>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <p className="text-emerald-700">Inflow: ${Math.round(wallet.inflowUsd24h).toLocaleString()}</p>
              <p className="text-rose-700">Outflow: ${Math.round(wallet.outflowUsd24h).toLocaleString()}</p>
              <p className={wallet.netFlowUsd24h >= 0 ? "text-emerald-700" : "text-rose-700"}>
                Net: ${Math.round(wallet.netFlowUsd24h).toLocaleString()}
              </p>
              <p className="text-zinc-700">Large tx: {wallet.largeTxCount24h}</p>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Last active: {wallet.lastActiveAt ? new Date(wallet.lastActiveAt).toLocaleString() : "No activity"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
