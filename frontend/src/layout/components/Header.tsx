import logo from "@/assets/pokenerdle.png";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/contexts/ThemeProviderContext";
import { Monitor, Moon, Sun } from "lucide-react";
import React from "react";
import classes from "./index.module.scss";

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className={classes.Header}>
      <img className={classes.Logo} src={logo} alt="PokéNerdle Logo" />
      <div className="tw:grow" />
      <Button variant="outline" onClick={toggleTheme} className="tw:size-10">
        {theme == "light" ? <Sun /> : theme == "dark" ? <Moon /> : <Monitor />}
      </Button>
    </header>
  );
};

export default Header;
