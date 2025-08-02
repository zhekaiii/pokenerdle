import logo from "@/assets/pokenerdle.png";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/contexts/ThemeProviderContext";
import { Monitor, Moon, Sun } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router";
import classes from "./index.module.scss";

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <header className={classes.Header}>
      <Link className="tw:contents" to="/">
        <img className={classes.Logo} src={logo} alt="PokéNerdle Logo" />
      </Link>
      <div className="tw:grow" />
      <Button
        asChild
        variant={location.pathname === "/how-to-play" ? "default" : "outline"}
        className="tw:mr-2"
      >
        <Link to="/how-to-play">How to Play</Link>
      </Button>
      <Button variant="outline" onClick={toggleTheme} className="tw:size-10">
        {theme == "light" ? <Sun /> : theme == "dark" ? <Moon /> : <Monitor />}
      </Button>
    </header>
  );
};

export default Header;
