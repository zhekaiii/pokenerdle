import { Button } from "@/components/ui/Button";
import { Link, useLocation } from "@tanstack/react-router";
import clsx from "clsx";
import { Calendar, LinkIcon, MapPin } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import useDetectKeyboardOpen from "use-detect-keyboard-open";
import classes from "./index.module.scss";
import { ProfileDropdownMenu } from "./ProfileDropdownMenu";
import { ProfileIcon } from "./ProfileIcon";

const MobileFooter: React.FC = () => {
  const isKeyboardOpen = useDetectKeyboardOpen();
  const location = useLocation();
  const { t } = useTranslation("nav");
  const navItems = [
    {
      to: "/daily",
      icon: Calendar,
      label: t("dailyChallenge"),
    },
    {
      to: "/pokechain",
      icon: LinkIcon,
      label: t("pokeChain"),
    },
    {
      to: "/path-finder",
      icon: MapPin,
      label: t("pathFinder"),
    },
  ];

  if (isKeyboardOpen) {
    return null;
  }

  return (
    <footer className={classes.MobileFooter}>
      <nav className={classes.MobileFooterNav}>
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive =
            location.pathname === to ||
            (to !== "/" && location.pathname.startsWith(to));
          return (
            <Button
              key={to}
              asChild
              variant="transparent"
              className={clsx(
                classes.NavButton,
                isActive && classes["NavButton--active"]
              )}
            >
              <Link to={to}>
                <div className={classes.NavItem}>
                  <Icon className={classes.NavIcon} />
                  <span className={classes.NavLabel}>{label}</span>
                </div>
              </Link>
            </Button>
          );
        })}
        <ProfileDropdownMenu
          trigger={
            <Button variant="transparent" className={classes.NavButton}>
              <div className={classes.NavItem}>
                <ProfileIcon />
                <span className={classes.NavLabel}>{t("profile")}</span>
              </div>
            </Button>
          }
          triggerAsChild
        />
      </nav>
    </footer>
  );
};

export default MobileFooter;
