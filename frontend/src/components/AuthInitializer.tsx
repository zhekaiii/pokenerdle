import { useAtom } from "jotai";
import { useEffect } from "react";
import { initAuthAtom } from "../atoms/auth";

export function AuthInitializer() {
  const [, initAuth] = useAtom(initAuthAtom);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    initAuth().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      cleanup?.();
    };
  }, [initAuth]);

  return null;
}
