import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { RouterProvider } from "react-router";
import "./App.scss";
import { SocketProvider } from "./contexts/SocketContext";
import { router } from "./routes";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

function App() {
  const darkMode = useMediaQuery("(prefers-color-scheme: dark)");

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <SocketProvider>
        <RouterProvider router={router} />
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
