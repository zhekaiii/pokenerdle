import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import i18n from "i18next";
import { Provider as JotaiProvider } from "jotai";
import { Store } from "jotai/vanilla/store";
import { PostHogErrorBoundary, PostHogProvider } from "posthog-js/react";
import { I18nextProvider } from "react-i18next";
import { store as defaultStore } from "./atoms/store";
import { AuthInitializer } from "./components/AuthInitializer";
import { SocketContext } from "./hooks/useSocket";
import "./index.scss";
import { ErrorPage } from "./layout/ErrorPage";
import { PokeNerdleSocket } from "./lib/types";

interface AppProviderProps {
  i18nInstance?: typeof i18n;
  children: React.ReactNode;
  store?: Store;
  queryClient: QueryClient;
  socket: PokeNerdleSocket;
}

function AppProvider({
  i18nInstance,
  children,
  store = defaultStore,
  queryClient,
  socket,
}: AppProviderProps) {
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
      <PostHogErrorBoundary fallback={ErrorPage}>
        <JotaiProvider store={store}>
          <AuthInitializer />
          <SocketContext.Provider value={socket}>
            <QueryClientProvider client={queryClient}>
              <I18nextProvider i18n={i18nInstance || i18n}>
                {children}
              </I18nextProvider>
            </QueryClientProvider>
          </SocketContext.Provider>
        </JotaiProvider>
      </PostHogErrorBoundary>
    </PostHogProvider>
  );
}

export default AppProvider;
