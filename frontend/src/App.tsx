import { RouterProvider } from "react-router";
import "./App.scss";
import { Toaster } from "./components/ui/Toaster";
import { SocketProvider } from "./contexts/SocketContext";
import { ThemeProvider } from "./contexts/ThemeProviderContext";
import { router } from "./routes";
import "./styles/typography.scss";

function App() {
  return (
    <ThemeProvider storageKey="vite-ui-theme">
      <SocketProvider>
        <RouterProvider router={router} />
        <Toaster />
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
