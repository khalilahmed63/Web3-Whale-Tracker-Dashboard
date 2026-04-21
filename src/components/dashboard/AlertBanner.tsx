import type { UiAlert } from "@/types/alert";
import { ChainBadge } from "@/components/dashboard/ChainIcon";

interface AlertBannerProps {
  alert: UiAlert | null;
}

export function AlertBanner({ alert }: AlertBannerProps) {
  if (!alert) return null;

  const styles =
    alert.severity === "critical"
      ? "border-rose-800 bg-rose-900/30 text-rose-200"
      : alert.severity === "warning"
        ? "border-amber-800 bg-amber-900/30 text-amber-200"
        : "border-sky-800 bg-sky-900/30 text-sky-200";

  return (
    <div className={`rounded-2xl border p-4 text-sm shadow-xl shadow-black/25 transition hover:border-zinc-600 ${styles}`}>
      <p className="font-semibold uppercase tracking-wide">Priority Alert</p>
      <p className="mt-1">
        <span className="font-medium">Large transfer detected:</span> {alert.message}
      </p>
      <div className="mt-2">
        <ChainBadge chain={alert.chain} size="md" />
      </div>
    </div>
  );
}
