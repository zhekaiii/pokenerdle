import logo from "@/assets/pokenerdle.png";
import { themeAtom, toggleThemeAtom } from "@/atoms/theme";
import LinkButton from "@/components/recyclables/LinkButton";
import breakpoints from "@/utils/breakpoints";
import clsx from "clsx";
import { useAtom } from "jotai";
import { Menu } from "lucide-react";
import React from "react";
import { Link } from "react-router";
import { useMedia } from "react-use";
import classes from "./index.module.scss";
import NavDrawer from "./NavDrawer";
import RulePageButton from "./RulePageButton";

const Header: React.FC = () => {
  const [theme] = useAtom(themeAtom);
  const [, toggleTheme] = useAtom(toggleThemeAtom);
  const isSmallerThanSm = useMedia(`(max-width: ${breakpoints.sm}px)`);

  return (
    <header
      className={clsx(
        classes.Header,
        isSmallerThanSm && classes["Header--small"]
      )}
    >
      <NavDrawer trigger={<Menu className="tw:size-6" />} />
      <Link className="tw:contents" to="/">
        <img className={classes.Logo} src={logo} alt="PokéNerdle Logo" />
      </Link>
      <div className="tw:grow" />
      {!isSmallerThanSm && (
        <>
          <LinkButton to="/daily">Daily</LinkButton>
          <LinkButton to="/pokechain">PokéChain</LinkButton>
          <LinkButton to="/path-finder">Path Finder</LinkButton>
        </>
      )}
      <RulePageButton className="tw:mr-2" />
    </header>
  );
};

export default Header;
