import logo from "@/assets/pokenerdle.png";
import LinkButton from "@/components/recyclables/LinkButton";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/contexts/ThemeProviderContext";
import breakpoints from "@/utils/breakpoints";
import clsx from "clsx";
import { Menu, Monitor, Moon, Sun } from "lucide-react";
import React from "react";
import { Link } from "react-router";
import { useMedia } from "react-use";
import classes from "./index.module.scss";
import NavDrawer from "./NavDrawer";
import RulePageButton from "./RulePageButton";

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isSmallerThanSm = useMedia(`(max-width: ${breakpoints.sm}px)`);

  return (
    <header
      className={clsx(
        classes.Header,
        isSmallerThanSm && classes["Header--small"]
      )}
    >
      {isSmallerThanSm && (
        <NavDrawer trigger={<Menu className="tw:size-6" />} />
      )}
      <Link className="tw:contents" to="/">
        <img className={classes.Logo} src={logo} alt="PokéNerdle Logo" />
      </Link>
      <div className="tw:grow" />
      {!isSmallerThanSm && (
        <>
          <LinkButton className="tw:mr-2" to="/pokechain">
            PokéChain
          </LinkButton>
          <LinkButton className="tw:mr-2" to="/path-finder">
            Path Finder
          </LinkButton>
        </>
      )}
      <RulePageButton className="tw:mr-2" />
      {!isSmallerThanSm && (
        <Button variant="outline" onClick={toggleTheme} className="tw:size-10">
          {theme == "light" ? (
            <Sun />
          ) : theme == "dark" ? (
            <Moon />
          ) : (
            <Monitor />
          )}
        </Button>
      )}
    </header>
  );
};

export default Header;
