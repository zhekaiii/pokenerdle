import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import "./App.scss";
import LinkBattle from "./components/LinkBattle";

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
      <LinkBattle />
    </ThemeProvider>
  );
}

export default App;
