import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { RouterProvider } from "react-router-dom";
import "./App.scss";
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
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
