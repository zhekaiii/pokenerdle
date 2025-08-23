import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import clsx from "clsx";
import { Calendar, LinkIcon, MapPin, UserCircle } from "lucide-react";
import React from "react";
import { Link, matchPath, useLocation } from "react-router";
import useDetectKeyboardOpen from "use-detect-keyboard-open";
import classes from "./index.module.scss";
import { ProfileDropdownMenu } from "./ProfileDropdownMenu";

const MobileFooter: React.FC = () => {
  const isKeyboardOpen = useDetectKeyboardOpen();
  const { user } = useAuth();
  const location = useLocation();
  const navItems = [
    {
      to: "/daily",
      icon: Calendar,
      label: "Daily",
    },
    {
      to: "/pokechain",
      icon: LinkIcon,
      label: "PokéChain",
    },
    {
      to: "/path-finder",
      icon: MapPin,
      label: "Path Finder",
    },
  ];

  if (isKeyboardOpen) {
    return null;
  }

  return (
    <footer className={classes.MobileFooter}>
      <nav className={classes.MobileFooterNav}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <Button
            key={to}
            asChild
            variant="transparent"
            className={clsx(
              classes.NavButton,
              matchPath(to, location.pathname) && classes["NavButton--active"]
            )}
          >
            <Link to={to}>
              <div className={classes.NavItem}>
                <Icon className={classes.NavIcon} />
                <span className={classes.NavLabel}>{label}</span>
              </div>
            </Link>
          </Button>
        ))}
        <ProfileDropdownMenu
          trigger={
            <Button variant="transparent" className={classes.NavButton}>
              <div className={classes.NavItem}>
                {user && user.user_metadata.avatar_url ? (
                  <div
                    className={clsx(
                      classes.NavIcon,
                      "tw:rounded-full tw:bg-cover tw:bg-center"
                    )}
                    style={{
                      backgroundImage: `url(${user.user_metadata.avatar_url})`,
                    }}
                  />
                ) : (
                  <UserCircle className={classes.NavIcon} />
                )}
                <span className={classes.NavLabel}>Profile</span>
              </div>
            </Button>
          }
        />
      </nav>
    </footer>
  );
};

export default MobileFooter;
