import LinkButton from "@/components/recyclables/LinkButton";
import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

type Props = {
  className?: string;
};

const RulePageButton: React.FC<Props> = ({ className }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const isRulePage = location.pathname.startsWith("/how-to-play");
  const rulePage = isRulePage
    ? location.pathname.replace("/how-to-play", "")
    : "/how-to-play" + location.pathname;

  return (
    <LinkButton to={rulePage} className={className} activeOverride={isRulePage}>
      {isRulePage ? t("nav:backToGame") : t("nav:howToPlay")}
    </LinkButton>
  );
};

export default RulePageButton;
