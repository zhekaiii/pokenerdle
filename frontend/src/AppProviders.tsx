import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import i18n from "i18next";
import { PostHogErrorBoundary, PostHogProvider } from "posthog-js/react";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { useThemeListener } from "./atoms/theme";
import { AuthInitializer } from "./components/AuthInitializer";
import { Toaster } from "./components/ui/Toaster";
import { SocketProvider } from "./contexts/SocketContext";
import "./index.css";
import ErrorPage from "./layout/ErrorPage";

interface AppProviderProps {
  i18nInstance?: typeof i18n;
  children: React.ReactNode;
}

function AppProvider({ i18nInstance, children }: AppProviderProps) {
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
            <I18nextProvider i18n={i18nInstance || i18n}>
              {children}
              <Toaster />
            </I18nextProvider>
          </QueryClientProvider>
        </SocketProvider>
      </PostHogErrorBoundary>
    </PostHogProvider>
  );
}

export default AppProvider;
