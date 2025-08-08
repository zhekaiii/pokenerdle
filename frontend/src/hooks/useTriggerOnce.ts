import { useEffect, useRef } from "react";

export function useTriggerOnce(
  condition: boolean,
  callback: React.EffectCallback,
  deps: React.DependencyList
): void {
  const triggered = useRef(false);

  useEffect(() => {
    if (!condition || triggered.current) return;
    triggered.current = true;
    return callback();
  }, deps);
}
