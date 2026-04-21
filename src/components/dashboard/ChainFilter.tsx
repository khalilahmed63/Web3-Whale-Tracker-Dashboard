"use client";

import type { SupportedChain } from "@/types/transaction";
import { ChainIcon } from "@/components/dashboard/ChainIcon";

interface ChainFilterProps {
  selectedChain: SupportedChain | "all";
  onChange: (chain: SupportedChain | "all") => void;
}

const OPTIONS: Array<SupportedChain | "all"> = ["all", "ethereum", "base", "polygon"];

export function ChainFilter({ selectedChain, onChange }: ChainFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-zinc-700 bg-zinc-900/70 p-2.5 shadow-xl shadow-black/20 backdrop-blur">
      {OPTIONS.map((chain) => (
        <button
          key={chain}
          type="button"
          onClick={() => onChange(chain)}
          className={`rounded-xl px-3.5 py-2 text-sm font-medium capitalize transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
            selectedChain === chain
              ? "bg-white text-zinc-900 shadow-sm"
              : "bg-zinc-800 text-zinc-300 hover:-translate-y-0.5 hover:bg-zinc-700"
          }`}
          aria-pressed={selectedChain === chain}
        >
          <span className="inline-flex items-center gap-2">
            {chain === "all" ? (
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-700">
                A
              </span>
            ) : (
              <ChainIcon chain={chain} size="md" />
            )}
            {chain === "all" ? "All chains" : chain}
          </span>
        </button>
      ))}
    </div>
  );
}
