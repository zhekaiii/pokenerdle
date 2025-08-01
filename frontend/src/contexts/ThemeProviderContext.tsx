import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  toggleTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

const setThemeClass = (theme: Exclude<Theme, "system">) => {
  const root = window.document.documentElement;
  root.classList.remove("tw:light", "tw:dark");
  root.classList.add(`tw:${theme}`);
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, _setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  const setTheme = (theme: Theme) => {
    localStorage.setItem(storageKey, theme);
    _setTheme(theme);
  };

  const toggleTheme = () => {
    setTheme(
      (
        {
          dark: "light",
          light: "system",
          system: "dark",
        } as const
      )[theme]
    );
  };

  useEffect(() => {
    const root = window.document.documentElement;

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

  const value = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
