import React from "react";
import { Link, To, useMatch } from "react-router";
import { Button } from "../ui/Button";

type Props = {
  to: To;
  children: React.ReactNode;
  className?: string;
  activeOverride?: boolean;
};

const LinkButton: React.FC<Props> = ({
  to,
  children,
  className,
  activeOverride,
}) => {
  const isActive = activeOverride ?? useMatch(to.toString());
  return (
    <Button
      asChild
      variant={isActive ? "default" : "ghost"}
      className={className}
    >
      <Link to={to}>{children}</Link>
    </Button>
  );
};

export default LinkButton;
