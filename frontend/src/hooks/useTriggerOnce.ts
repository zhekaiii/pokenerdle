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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps are handled by caller
  }, deps);
}
