interface WhaleSummaryCardsProps {
  totalWhales: number;
  totalInflowUsd: number;
  totalOutflowUsd: number;
  largeTxCount24h?: number;
  netFlowUsd24h?: number;
}

export function WhaleSummaryCards({
  totalWhales,
  totalInflowUsd,
  totalOutflowUsd,
  largeTxCount24h = 0,
  netFlowUsd24h = totalInflowUsd - totalOutflowUsd,
}: WhaleSummaryCardsProps) {
  const netTone = netFlowUsd24h >= 0 ? "text-emerald-600" : "text-rose-600";
  const cards = [
    { label: "Tracked whales", value: totalWhales.toString(), tone: "text-zinc-100", bg: "from-zinc-800/80 to-zinc-900" },
    { label: "24h inflow", value: `$${totalInflowUsd.toLocaleString()}`, tone: "text-emerald-400", bg: "from-emerald-900/40 to-zinc-900" },
    { label: "24h outflow", value: `$${totalOutflowUsd.toLocaleString()}`, tone: "text-rose-400", bg: "from-rose-900/40 to-zinc-900" },
    { label: "Net flow (24h)", value: `$${netFlowUsd24h.toLocaleString()}`, tone: netTone === "text-emerald-600" ? "text-emerald-400" : "text-rose-400", bg: "from-indigo-900/40 to-zinc-900" },
    { label: "Large tx (24h)", value: largeTxCount24h.toLocaleString(), tone: "text-amber-400", bg: "from-amber-900/40 to-zinc-900" },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-2xl border border-zinc-700/80 bg-gradient-to-br p-5 shadow-lg shadow-black/25 transition duration-200 hover:-translate-y-0.5 hover:border-zinc-600 hover:shadow-2xl ${card.bg}`}
        >
          <p className="text-xs uppercase tracking-wide text-zinc-400">{card.label}</p>
          <p className={`mt-3 text-3xl font-semibold leading-none ${card.tone}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
