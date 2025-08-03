import logo from "@/assets/pokenerdle.png";
import LinkButton from "@/components/recyclables/LinkButton";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/contexts/ThemeProviderContext";
import { Monitor, Moon, Sun } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router";
import classes from "./index.module.scss";

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isRulePage = location.pathname.startsWith("/how-to-play");
  const rulePage = isRulePage
    ? location.pathname.replace("/how-to-play", "")
    : location.pathname == "/path-finder"
    ? "/how-to-play/path-finder"
    : "/how-to-play/pokechain";

  return (
    <header className={classes.Header}>
      <Link className="tw:contents" to="/">
        <img className={classes.Logo} src={logo} alt="PokéNerdle Logo" />
      </Link>
      <div className="tw:grow" />
      <LinkButton to="/pokechain" className="tw:mr-2">
        PokéChain
      </LinkButton>
      <LinkButton to="/path-finder" className="tw:mr-2">
        Path Finder
      </LinkButton>
      <LinkButton to={rulePage} className="tw:mr-2" activeOverride={isRulePage}>
        {isRulePage ? "Back to Game" : "How to Play"}
      </LinkButton>
      <Button variant="outline" onClick={toggleTheme} className="tw:size-10">
        {theme == "light" ? <Sun /> : theme == "dark" ? <Moon /> : <Monitor />}
      </Button>
    </header>
  );
};

export default Header;
