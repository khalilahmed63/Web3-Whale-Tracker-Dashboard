"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  durationMs?: number;
  formatter?: (value: number) => string;
}

export function AnimatedNumber({
  value,
  durationMs = 650,
  formatter = (next) => Math.round(next).toLocaleString(),
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const start = previousValueRef.current;
    const delta = value - start;
    if (delta === 0) {
      previousValueRef.current = value;
      return;
    }

    const begin = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - begin) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(start + delta * eased);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        previousValueRef.current = value;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  const text = useMemo(() => formatter(displayValue), [displayValue, formatter]);
  return <>{text}</>;
}
