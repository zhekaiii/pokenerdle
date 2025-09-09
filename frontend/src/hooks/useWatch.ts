import { useEffect, useRef } from "react";

export const useWatch = <T extends React.DependencyList>(
  callback: (oldValue: T | undefined[], newValue: T) => void,
  deps: T
) => {
  const oldValues = useRef<T | undefined[]>([]);

  useEffect(() => {
    callback(oldValues.current, deps);
    oldValues.current = deps;
  }, [callback, deps]);
};
