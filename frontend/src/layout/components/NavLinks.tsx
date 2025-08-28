import LinkButton from "@/components/recyclables/LinkButton";
import React from "react";
import RulePageButton from "./RulePageButton";

interface Props {
  className?: string;
}

const NavLinks: React.FC<Props> = ({ className }) => {
  return (
    <>
      <LinkButton to="/pokechain" className={className}>
        PokéChain
      </LinkButton>
      <LinkButton to="/path-finder" className={className}>
        Path Finder
      </LinkButton>
      <RulePageButton className={className} />
    </>
  );
};

export default NavLinks;
