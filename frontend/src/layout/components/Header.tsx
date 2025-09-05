import LinkButton from "@/components/recyclables/LinkButton";
import breakpoints from "@/utils/breakpoints";
import { Link, useMatches } from "@tanstack/react-router";
import clsx from "clsx";
import React from "react";
import { useTranslation } from "react-i18next";
import useMedia from "react-use/lib/useMedia";
import classes from "./index.module.scss";
import { ProfileDropdownMenu } from "./ProfileDropdownMenu";
import { ProfileIcon } from "./ProfileIcon";
import RulePageButton from "./RulePageButton";

const Header: React.FC = () => {
  const isSmallerThanSm = useMedia(`(max-width: ${breakpoints.sm}px)`);
  const matches = useMatches();
  const shouldShowRuleButton = matches.some(
    (match) => match.context.shouldShowRuleButton
  );
  console.log({ matches });
  const { t } = useTranslation("nav");

  return (
    <header
      className={clsx(
        classes.Header,
        isSmallerThanSm && classes["Header--small"]
      )}
    >
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
          <LinkButton to="/daily">{t("dailyChallenge")}</LinkButton>
          <LinkButton to="/pokechain">{t("pokeChain")}</LinkButton>
          <LinkButton to="/path-finder">{t("pathFinder")}</LinkButton>
        </>
      )}
      {shouldShowRuleButton && <RulePageButton className="tw:mr-2" />}
      {!isSmallerThanSm && (
        <ProfileDropdownMenu
          trigger={<ProfileIcon sizeClassName="tw:size-7" />}
        />
      )}
    </header>
  );
};

export default Header;
