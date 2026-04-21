import type { UiAlert } from "@/types/alert";

interface AlertBannerProps {
  alert: UiAlert | null;
}

export function AlertBanner({ alert }: AlertBannerProps) {
  if (!alert) return null;

  const styles =
    alert.severity === "critical"
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : alert.severity === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-sky-200 bg-sky-50 text-sky-800";

  return (
    <div className={`rounded-xl border p-4 text-sm shadow-sm ${styles}`}>
      <p className="font-semibold uppercase tracking-wide">Priority Alert</p>
      <p className="mt-1">
        <span className="font-medium">Large transfer detected:</span> {alert.message}
      </p>
    </div>
  );
}
