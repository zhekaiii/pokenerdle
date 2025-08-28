import LinkButton from "@/components/recyclables/LinkButton";
import React from "react";
import { useLocation } from "react-router";

interface Props {
  className?: string;
}

const RulePageButton: React.FC<Props> = ({ className }) => {
  const location = useLocation();
  const isRulePage = location.pathname.startsWith("/how-to-play");
  const rulePage = isRulePage
    ? location.pathname.replace("/how-to-play", "")
    : "/how-to-play" + location.pathname;

  return (
    <LinkButton to={rulePage} className={className} activeOverride={isRulePage}>
      {isRulePage ? "Back to Game" : "How to Play"}
    </LinkButton>
  );
};

export default RulePageButton;
