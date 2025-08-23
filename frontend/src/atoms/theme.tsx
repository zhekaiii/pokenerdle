import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useEffect } from "react";

export type Theme = "dark" | "light" | "system";

export const THEMES: Theme[] = ["dark", "light", "system"];

export const themeAtom = atomWithStorage<Theme>("vite-ui-theme", "system");

export const toggleThemeAtom = atom(null, (get, set) => {
  set(themeAtom, THEMES[(THEMES.indexOf(get(themeAtom)) + 1) % THEMES.length]);
});

const setThemeClass = (theme: Exclude<Theme, "system">) => {
  const root = window.document.documentElement;
  root.classList.remove("tw:light", "tw:dark");
  root.classList.add(`tw:${theme}`);
  updatePwaThemeColour(theme);
};

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
  const [theme] = useAtom(themeAtom);

  useEffect(() => {
    if (theme !== "system") {
      setThemeClass(theme);
      return;
    }

    const onChange = (e: { matches: boolean }) => {
      const newTheme = e.matches ? "dark" : "light";
      setThemeClass(newTheme);
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
