import type { Theme } from "../atoms/theme";

/**
 * SSR Theme Utilities
 *
 * These utilities handle theme detection and application during server-side rendering
 * to prevent dark mode flickering. The theme is read from cookies and applied to the
 * HTML before it's sent to the client, ensuring the correct theme is visible immediately.
 */

/**
 * Get theme from cookies during SSR
 */
export function getThemeFromCookies(cookieHeader?: string): Theme {
  if (!cookieHeader) return "system";

  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const theme = cookies["vite-ui-theme"] as Theme;
  return theme && ["dark", "light", "system"].includes(theme)
    ? theme
    : "system";
}
