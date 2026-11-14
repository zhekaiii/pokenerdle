import { useEffect, useState } from "react";
import { prefersReducedMotion } from "./Background";

interface CountUpOptions {
  decimals?: number;
  durationMs?: number;
  // Seconds to wait before counting, so the count starts when the number appears. Pass the
  // same value as the element's `delay()`, which keeps the two from drifting apart.
  delaySeconds?: number;
}

// Counts from 0 up to `target` with an ease-out, rounded to `decimals` places. Under
// reduced motion the target shows straight away.
export const useCountUp = (
  target: number,
  { decimals = 0, durationMs = 900, delaySeconds = 0 }: CountUpOptions = {},
): number => {
  const [value, setValue] = useState(0);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const factor = 10 ** decimals;
    const startsAt = performance.now() + delaySeconds * 1000;
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, Math.max(0, (now - startsAt) / durationMs));
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased * factor) / factor);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, decimals, durationMs, delaySeconds, reduced]);

  return reduced ? target : value;
};
