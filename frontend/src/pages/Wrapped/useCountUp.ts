import { useEffect, useState } from "react";
import { prefersReducedMotion } from "./Background";

// Counts from 0 up to `target` with an ease-out, rounded to `decimals` places. Under
// reduced motion the target shows straight away.
export const useCountUp = (
  target: number,
  { decimals = 0, durationMs = 900 }: { decimals?: number; durationMs?: number } = {},
): number => {
  const [value, setValue] = useState(0);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const factor = 10 ** decimals;
    const startedAt = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased * factor) / factor);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, decimals, durationMs, reduced]);

  return reduced ? target : value;
};
