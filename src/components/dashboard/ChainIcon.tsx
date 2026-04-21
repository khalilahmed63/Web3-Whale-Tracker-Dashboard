import type { SupportedChain } from "@/types/transaction";

const CHAIN_META: Record<SupportedChain, { label: string; bg: string }> = {
  ethereum: { label: "Ethereum", bg: "bg-indigo-50 dark:bg-indigo-900/30" },
  base: { label: "Base", bg: "bg-blue-50 dark:bg-blue-900/30" },
  polygon: { label: "Polygon", bg: "bg-violet-50 dark:bg-violet-900/30" },
};

interface ChainIconProps {
  chain: SupportedChain;
  size?: "sm" | "md" | "lg";
}

export function ChainIcon({ chain, size = "sm" }: ChainIconProps) {
  const meta = CHAIN_META[chain];
  const sizeClass = size === "lg" ? "h-6 w-6" : size === "md" ? "h-5 w-5" : "h-4 w-4";

  const icon =
    chain === "ethereum" ? (
      <svg viewBox="0 0 24 24" className={`${sizeClass}`} aria-hidden="true">
        <path d="M12 2L6.5 12L12 9.4L17.5 12L12 2Z" fill="#627EEA" />
        <path d="M12 9.4L6.5 12.4L12 15.4L17.5 12.4L12 9.4Z" fill="#627EEA" opacity="0.85" />
        <path d="M12 22L6.5 13.4L12 16.5L17.5 13.4L12 22Z" fill="#627EEA" opacity="0.7" />
      </svg>
    ) : chain === "base" ? (
      <svg viewBox="0 0 24 24" className={`${sizeClass}`} aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#0052FF" />
        <circle cx="12" cy="12" r="4.5" fill="white" />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" className={`${sizeClass}`} aria-hidden="true">
        <path
          d="M9 7.5C9 6.1 10.1 5 11.5 5H15.5C16.9 5 18 6.1 18 7.5V10.5C18 11.9 16.9 13 15.5 13H11.5C10.1 13 9 11.9 9 10.5V7.5Z"
          stroke="#8247E5"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M6 13.5C6 12.1 7.1 11 8.5 11H12.5C13.9 11 15 12.1 15 13.5V16.5C15 17.9 13.9 19 12.5 19H8.5C7.1 19 6 17.9 6 16.5V13.5Z"
          stroke="#8247E5"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="10.5" cy="9" r="1.1" fill="#8247E5" />
        <circle cx="13.5" cy="15" r="1.1" fill="#8247E5" />
      </svg>
    );

  return (
    <span
      aria-label={meta.label}
      className={`inline-flex items-center justify-center rounded-full ${size === "lg" ? "p-1" : "p-0.5"} ${meta.bg}`}
    >
      {icon}
    </span>
  );
}

interface ChainBadgeProps {
  chain: SupportedChain;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ChainBadge({ chain, className = "", size = "sm" }: ChainBadgeProps) {
  const meta = CHAIN_META[chain];
  const badgeSizeClass =
    size === "lg"
      ? "px-3 py-1.5 text-sm"
      : size === "md"
        ? "px-2.5 py-1 text-xs"
        : "px-2 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-zinc-100 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 ${badgeSizeClass} ${className}`}
    >
      <ChainIcon chain={chain} size={size === "lg" ? "md" : "sm"} />
      {meta.label}
    </span>
  );
}
