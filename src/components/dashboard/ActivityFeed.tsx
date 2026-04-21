import type { UiAlert } from "@/types/alert";
import { useMemo, useState } from "react";
import { ChainBadge } from "@/components/dashboard/ChainIcon";
import { SpotlightPanel } from "@/components/dashboard/SpotlightPanel";

interface ActivityFeedProps {
  alerts: UiAlert[];
  nowMs: number;
  compact?: boolean;
  isLoading?: boolean;
}

export function ActivityFeed({ alerts, nowMs, compact = false, isLoading = false }: ActivityFeedProps) {
  const PAGE_SIZE = 5;
  const [page, setPage] = useState(1);

  function toneStyles(severity: UiAlert["severity"]) {
    if (severity === "critical") {
      return "border-rose-800 bg-rose-900/30 text-rose-300";
    }
    if (severity === "warning") {
      return "border-amber-800 bg-amber-900/30 text-amber-300";
    }
    return "border-sky-800 bg-sky-900/30 text-sky-300";
  }

  function relativeTime(value: string) {
    const then = new Date(value).getTime();
    const diffSec = Math.max(0, Math.floor((nowMs - then) / 1000));
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${Math.floor(diffHr / 24)}d ago`;
  }

  const totalPages = Math.max(1, Math.ceil(alerts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedAlerts = useMemo(
    () => alerts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [alerts, currentPage],
  );

  return (
    <SpotlightPanel
      className={`flex ${compact ? "h-[520px]" : "h-[560px]"} flex-col rounded-2xl border border-zinc-700 bg-zinc-900 p-5 shadow-xl shadow-black/25 transition duration-300 hover:border-zinc-600`}
      glowColor="rgba(236,72,153,0.12)"
      glowSizePx={320}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-100">Whale activity feed</h2>
        <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-300">
          {alerts.length} events
        </span>
      </div>
      <ul className={`mt-3 flex-1 overflow-y-auto pr-1 ${compact ? "space-y-1.5" : "space-y-2"}`}>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <li key={`loading-${index}`} className="rounded-xl border border-zinc-700 bg-zinc-800/50 px-3 py-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-700/80" />
              <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-zinc-700/60" />
            </li>
          ))
        ) : alerts.length === 0 ? (
          <li className="rounded-lg border border-dashed border-zinc-700 px-3 py-6 text-center text-sm text-zinc-400">
            <p className="text-lg">🚨</p>
            <p className="mt-1">No whale events yet. New large transfers will appear here automatically.</p>
          </li>
        ) : (
          pagedAlerts.map((alert) => (
            <li
              key={alert.id}
              className={`rounded-xl border border-zinc-700 bg-linear-to-br from-zinc-800 to-zinc-900 text-zinc-200 transition hover:border-zinc-600 hover:shadow-lg hover:shadow-black/20 ${compact ? "px-2.5 py-2.5 text-[13px]" : "px-3 py-3 text-sm"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={compact ? "line-clamp-1" : "line-clamp-2"}>{alert.message}</p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {new Date(alert.createdAt).toLocaleString()} · {relativeTime(alert.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <ChainBadge chain={alert.chain} size="md" />
                  <span
                    className={`rounded-full border px-2 py-1 text-[11px] font-medium uppercase ${toneStyles(alert.severity)}`}
                  >
                    {alert.severity}
                  </span>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
      {!isLoading && alerts.length > 0 ? (
        <div className="mt-3 flex items-center justify-between border-t border-zinc-700 pt-3 text-xs">
          <p className="text-zinc-400">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, alerts.length)} of{" "}
            {alerts.length}
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
    </SpotlightPanel>
  );
}
