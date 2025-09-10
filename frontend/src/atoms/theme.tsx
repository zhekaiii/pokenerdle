import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai/vanilla";
import Cookies from "js-cookie";

export type Theme = "dark" | "light" | "system";

export const THEMES: Theme[] = ["dark", "light", "system"];

export const themeAtom = import.meta.env.SSR
  ? atom<Theme>("system")
  : atomWithStorage<Theme>("vite-ui-theme", "system", {
      getItem: (key, initialValue) => {
        const theme = Cookies.get(key);
        return (theme ?? initialValue) as Theme;
      },
      setItem: (key, value) => {
        Cookies.set(key, value, {
          expires: 365 * 10,
        });
      },
      removeItem: (key) => Cookies.remove(key),
      subscribe: isSecureContext
        ? (key, callback, initialValue) => {
            const listener = (e: CookieChangeEvent) => {
              for (const changed of e.changed) {
                if (changed.name === key) {
                  callback(changed.value as Theme);
                  return;
                }
              }
              for (const deleted of e.deleted) {
                if (deleted.name === key) {
                  callback(initialValue);
                  return;
                }
              }
            };
            cookieStore.addEventListener("change", listener);
            return () => cookieStore.removeEventListener("change", listener);
          }
        : undefined,
    });
