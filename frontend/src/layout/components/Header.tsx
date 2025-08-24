import LinkButton from "@/components/recyclables/LinkButton";
import { useRouteHandles } from "@/hooks/useRouteHandles";
import breakpoints from "@/utils/breakpoints";
import clsx from "clsx";
import { Menu } from "lucide-react";
import React from "react";
import { Link } from "react-router";
import { useMedia } from "react-use";
import classes from "./index.module.scss";
import NavDrawer from "./NavDrawer";
import RulePageButton from "./RulePageButton";

const Header: React.FC = () => {
  const isSmallerThanSm = useMedia(`(max-width: ${breakpoints.sm}px)`);
  const routeHandles = useRouteHandles();
  const shouldShowRuleButton = routeHandles.some(
    ({ shouldShowRuleButton }) => shouldShowRuleButton
  );

  return (
    <header
      className={clsx(
        classes.Header,
        isSmallerThanSm && classes["Header--small"]
      )}
    >
      {!isSmallerThanSm && (
        <NavDrawer trigger={<Menu className="tw:size-6" />} />
      )}
      <Link className="tw:contents" to="/">
        <img
          className={classes.Logo}
          src="/pokenerdle.png"
          alt="PokéNerdle Logo"
        />
      </Link>
      <div className="tw:grow" />
      {!isSmallerThanSm && (
        <>
          <LinkButton to="/daily">Daily</LinkButton>
          <LinkButton to="/pokechain">PokéChain</LinkButton>
          <LinkButton to="/path-finder">Path Finder</LinkButton>
        </>
      )}
      {shouldShowRuleButton && <RulePageButton className="tw:mr-2" />}
    </header>
  );
};

export default Header;
