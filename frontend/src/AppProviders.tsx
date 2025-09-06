import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterClient } from "@tanstack/react-router/ssr/client";
import { PostHogErrorBoundary, PostHogProvider } from "posthog-js/react";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { useThemeListener } from "./atoms/theme";
import { AuthInitializer } from "./components/AuthInitializer";
import { Toaster } from "./components/ui/Toaster";
import { SocketProvider } from "./contexts/SocketContext";
import ErrorPage from "./layout/ErrorPage";
import i18n from "./lib/i18n";
import { createRouter } from "./router";

const router = createRouter();

function AppProvider() {
  useThemeListener();
  const [queryClient] = useState(() => new QueryClient());

  return (
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
        <AuthInitializer />
        <SocketProvider>
          <QueryClientProvider client={queryClient}>
            <I18nextProvider i18n={i18n}>
              <RouterClient router={router} />
              <Toaster />
            </I18nextProvider>
          </QueryClientProvider>
        </SocketProvider>
      </PostHogErrorBoundary>
    </PostHogProvider>
  );
}

export default AppProvider;
