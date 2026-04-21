"use client";

import type { SupportedChain } from "@/types/transaction";

interface ChainFilterProps {
  selectedChain: SupportedChain | "all";
  onChange: (chain: SupportedChain | "all") => void;
}

const OPTIONS: Array<SupportedChain | "all"> = ["all", "ethereum", "base", "polygon"];

export function ChainFilter({ selectedChain, onChange }: ChainFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-zinc-200 bg-white p-2 shadow-sm">
      {OPTIONS.map((chain) => (
        <button
          key={chain}
          type="button"
          onClick={() => onChange(chain)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
            selectedChain === chain
              ? "bg-zinc-900 text-white shadow-sm"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
          }`}
        >
          {chain === "all" ? "All chains" : chain}
        </button>
      ))}
    </div>
  );
}
