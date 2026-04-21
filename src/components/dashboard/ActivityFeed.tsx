import type { UiAlert } from "@/types/alert";

interface ActivityFeedProps {
  alerts: UiAlert[];
}

export function ActivityFeed({ alerts }: ActivityFeedProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-zinc-900">Whale activity feed</h2>
      <ul className="mt-3 space-y-2">
        {alerts.length === 0 ? (
          <li className="text-sm text-zinc-500">No activity yet.</li>
        ) : (
          alerts.slice(0, 8).map((alert) => (
            <li key={alert.id} className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
              <p>{alert.message}</p>
              <p className="mt-1 text-xs text-zinc-500">{new Date(alert.createdAt).toLocaleString()}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
