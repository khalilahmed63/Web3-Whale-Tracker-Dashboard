interface ToastItem {
  id: string;
  title: string;
  message: string;
  tone: "info" | "warning" | "critical";
}

interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) return null;

  const toneStyles: Record<ToastItem["tone"], string> = {
    info: "border-sky-800 bg-sky-900/40 text-sky-200",
    warning: "border-amber-800 bg-amber-900/40 text-amber-200",
    critical: "border-rose-800 bg-rose-900/40 text-rose-200",
  };

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-2xl border p-3 shadow-xl shadow-black/25 backdrop-blur ${toneStyles[toast.tone]}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide">{toast.title}</p>
              <p className="mt-1 text-sm">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="rounded px-2 py-1 text-xs font-medium transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
