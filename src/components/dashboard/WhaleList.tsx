import type { TrackedWallet } from "@/types/wallet";

interface WhaleListProps {
  wallets: TrackedWallet[];
}

export function WhaleList({ wallets }: WhaleListProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-zinc-900">Tracked whales</h2>
      <ul className="mt-3 space-y-2">
        {wallets.map((wallet) => (
          <li key={wallet.address} className="rounded-md border border-zinc-100 px-3 py-2">
            <p className="text-sm font-medium text-zinc-800">{wallet.label}</p>
            <p className="text-xs text-zinc-500">
              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)} · {wallet.chains.join(", ")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
