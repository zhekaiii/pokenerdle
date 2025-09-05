import { Link, LinkProps, useMatchRoute } from "@tanstack/react-router";
import React from "react";
import { Button } from "../ui/Button";

interface Props {
  to: LinkProps["to"];
  children: React.ReactNode;
  className?: string;
  activeOverride?: boolean;
}

const LinkButton: React.FC<Props> = ({
  to,
  children,
  className,
  activeOverride,
}) => {
  const isActive = useMatchRoute()({ to });
  return (
    <Button
      asChild
      variant={activeOverride ?? isActive ? "default" : "ghost"}
      className={className}
    >
      <Link to={to}>{children}</Link>
    </Button>
  );
};

export default LinkButton;
