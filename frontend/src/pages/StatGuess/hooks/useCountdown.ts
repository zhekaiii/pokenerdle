import { useEffect, useRef, useState } from "react";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- prefer type aliases
type UseCountdownProps = {
  durationMs: number;
  onComplete: () => void;
  active: boolean;
};

/**
 * Returns elapsed milliseconds since `active` flipped true.
 * Pauses while the document is hidden, resumes on visibility return.
 * Calls `onComplete` exactly once when elapsed >= durationMs.
 */
export const useCountdown = ({
  durationMs,
  onComplete,
  active,
}: UseCountdownProps) => {
  const [elapsed, setElapsed] = useState(0);
  const lastTickRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset elapsed when countdown inactive
      setElapsed(0);
      lastTickRef.current = null;
      completedRef.current = false;
      return;
    }

    let frame: number;
    const tick = (now: number) => {
      if (document.visibilityState !== "visible") {
        lastTickRef.current = null;
        frame = requestAnimationFrame(tick);
        return;
      }
      if (lastTickRef.current === null) {
        lastTickRef.current = now;
      }
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;
      setElapsed((prev) => {
        const next = prev + dt;
        if (next >= durationMs && !completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current();
        }
        return next;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, durationMs]);

  const progress = Math.min(elapsed / durationMs, 1);
  return { elapsed, progress };
};
