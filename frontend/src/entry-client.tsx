import { PostHogErrorBoundary, PostHogProvider } from "posthog-js/react";
import React from "react";
import { hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import ErrorPage from "./layout/ErrorPage";
import "./lib/i18n.ts";

// This resolves the issue where rebuilding produces different hashes for the same file,
// causing the browser to load the old filename (which doesn't exist).
// https://vitejs.dev/guide/build#load-error-handling
window.addEventListener("vite:preloadError", (e) => {
  e.preventDefault();
  window.location.reload();
});

hydrateRoot(
  document.getElementById("root")!,
  <React.StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        defaults: "2025-05-24",
        capture_exceptions: true, // This enables capturing exceptions using Error Tracking
        debug: import.meta.env.MODE === "development",
      }}
    >
      <PostHogErrorBoundary fallback={<ErrorPage />}>
        <App />
      </PostHogErrorBoundary>
    </PostHogProvider>
  </React.StrictMode>
);
