type Theme = "dark" | "light" | "system";
(function () {
  function updatePwaThemeColour(theme: Exclude<Theme, "system">) {
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) return;

    const colors: Record<Exclude<Theme, "system">, string> = {
      light: "#ffffff", // --card in light mode: oklch(1 0 0)
      dark: "#171717", // --card in dark mode: oklch(0.205 0 0) converted to hex
    };

    themeColorMeta.setAttribute("content", colors[theme]);
  }

  function getCookie(name: string): string | null {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) {
      const result = parts.pop()?.split(";").shift();
      return result || null;
    }
    return null;
  }

  function handleThemeChange() {
    const theme = (getCookie("vite-ui-theme") as Theme) || "system";

    if (theme !== "system") {
      updatePwaThemeColour(theme as Exclude<Theme, "system">);
      return;
    }

    // For system theme, use the current media query state
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const newTheme = mediaQuery.matches ? "dark" : "light";
    updatePwaThemeColour(newTheme);
  }

  function initThemeListener() {
    // Handle system theme changes
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const theme = (getCookie("vite-ui-theme") as Theme) || "system";
      if (theme !== "system") return;
      const newTheme = e.matches ? "dark" : "light";
      updatePwaThemeColour(newTheme);
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    onChange(mediaQuery);
    mediaQuery.addEventListener("change", onChange);

    // Handle cookie changes (theme switching)
    if (isSecureContext && "cookieStore" in window) {
      const cookieListener = (e: CookieChangeEvent) => {
        for (const changed of e.changed) {
          if (changed.name === "vite-ui-theme") {
            handleThemeChange();
            return;
          }
        }
        for (const deleted of e.deleted) {
          if (deleted.name === "vite-ui-theme") {
            handleThemeChange();
            return;
          }
        }
      };

      cookieStore.addEventListener("change", cookieListener);
    }
  }

  // Initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      handleThemeChange(); // Set initial theme
      initThemeListener();
    });
  } else {
    handleThemeChange(); // Set initial theme
    initThemeListener();
  }
})();
