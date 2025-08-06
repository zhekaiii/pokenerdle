import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import "./App.scss";
import { Toaster } from "./components/ui/Toaster";
import { SocketProvider } from "./contexts/SocketContext";
import { ThemeProvider } from "./contexts/ThemeProviderContext";
import { queryClient } from "./lib/query";
import { router } from "./routes";

function App() {
  return (
    <ThemeProvider storageKey="vite-ui-theme">
      <SocketProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster />
        </QueryClientProvider>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
