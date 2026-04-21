"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";

interface SpotlightPanelProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  glowSizePx?: number;
}

export function SpotlightPanel({
  children,
  className = "",
  glowColor = "rgba(99,102,241,0.16)",
  glowSizePx = 280,
}: SpotlightPanelProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setIsTouchDevice(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    event.currentTarget.style.setProperty("--spotlight-x", `${x}px`);
    event.currentTarget.style.setProperty("--spotlight-y", `${y}px`);
  };

  const overlayStyle = {
    background: `radial-gradient(${glowSizePx}px circle at var(--spotlight-x) var(--spotlight-y), ${glowColor}, transparent 70%)`,
  } as CSSProperties;

  return (
    <div
      onMouseMove={isTouchDevice ? undefined : handleMouseMove}
      className={`group relative overflow-hidden [--spotlight-x:50%] [--spotlight-y:50%] ${className}`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${
          isTouchDevice ? "opacity-0" : "opacity-0 group-hover:opacity-100"
        }`}
        style={overlayStyle}
      />
      <div className="relative z-10 flex h-full min-h-0 w-full flex-col">{children}</div>
    </div>
  );
}
