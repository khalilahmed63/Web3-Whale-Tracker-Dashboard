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
    { label: "Tracked whales", value: totalWhales.toString(), tone: "text-zinc-900" },
    { label: "24h inflow", value: `$${totalInflowUsd.toLocaleString()}`, tone: "text-emerald-600" },
    { label: "24h outflow", value: `$${totalOutflowUsd.toLocaleString()}`, tone: "text-rose-600" },
    { label: "Net flow (24h)", value: `$${netFlowUsd24h.toLocaleString()}`, tone: netTone },
    { label: "Large tx (24h)", value: largeTxCount24h.toLocaleString(), tone: "text-amber-600" },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-4 shadow-sm"
        >
          <p className="text-xs uppercase tracking-wide text-zinc-500">{card.label}</p>
          <p className={`mt-2 text-3xl font-semibold leading-none ${card.tone}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
