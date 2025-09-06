import LinkButton from "@/components/recyclables/LinkButton";
import { LinkProps, useLocation } from "@tanstack/react-router";
import React from "react";
import { useTranslation } from "react-i18next";

interface Props {
  className?: string;
}

const RulePageButton: React.FC<Props> = ({ className }) => {
  const { t } = useTranslation("nav");
  const location = useLocation();
  const isRulePage = location.pathname.startsWith("/how-to-play");
  const rulePage = (
    isRulePage
      ? location.pathname.replace("/how-to-play", "")
      : "/how-to-play" + location.pathname
  ) as LinkProps["to"];

  return (
    <LinkButton to={rulePage} className={className} activeOverride={isRulePage}>
      {isRulePage ? t("backToGame") : t("howToPlay")}
    </LinkButton>
  );
};

export default RulePageButton;
