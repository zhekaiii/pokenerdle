import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import "./App.scss";
import { useThemeListener } from "./atoms/theme";
import { Toaster } from "./components/ui/Toaster";
import { SocketProvider } from "./contexts/SocketContext";
import { queryClient } from "./lib/query";
import { router } from "./routes";

function App() {
  useThemeListener();

  return (
    <SocketProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </SocketProvider>
  );
}

export default App;
