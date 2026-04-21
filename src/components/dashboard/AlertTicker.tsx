import type { UiAlert } from "@/types/alert";

interface AlertTickerProps {
  alerts: UiAlert[];
}

export function AlertTicker({ alerts }: AlertTickerProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-zinc-900">Latest alerts</h2>
      <ul className="mt-3 space-y-2">
        {alerts.length === 0 ? (
          <li className="text-sm text-zinc-500">No active alerts.</li>
        ) : (
          alerts.map((alert) => (
            <li key={alert.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-700">{alert.message}</span>
              <span
                className={`rounded px-2 py-0.5 text-xs font-medium ${
                  alert.severity === "critical"
                    ? "bg-rose-100 text-rose-700"
                    : alert.severity === "warning"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-sky-100 text-sky-700"
                }`}
              >
                {alert.severity}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
