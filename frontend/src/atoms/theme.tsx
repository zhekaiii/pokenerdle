import { useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai/vanilla";
import Cookies from "js-cookie";
import { useEffect } from "react";

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

const updatePwaThemeColour = (theme: Exclude<Theme, "system">) => {
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeColorMeta) return;

  const colors = {
    light: "#ffffff", // --card in light mode: oklch(1 0 0)
    dark: "#171717", // --card in dark mode: oklch(0.205 0 0) converted to hex
  };

  themeColorMeta.setAttribute("content", colors[theme]);
};

export function useThemeListener() {
  const theme = useAtomValue(themeAtom);

  useEffect(() => {
    if (theme !== "system") {
      updatePwaThemeColour(theme);
      return;
    }

    const onChange = (e: { matches: boolean }) => {
      const newTheme = e.matches ? "dark" : "light";
      updatePwaThemeColour(newTheme);
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    onChange(mediaQuery);
    mediaQuery.addEventListener("change", onChange);

    return () => {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", onChange);
    };
  }, [theme]);
}
