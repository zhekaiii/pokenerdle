import GoogleIcon from "@/assets/google.svg?react";
import { themeAtom, THEMES } from "@/atoms/theme";
import LanguageSelector from "@/components/LanguageSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { useGoogleSignIn } from "@/components/ui/GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";
import clsx from "clsx";
import { useAtom } from "jotai";
import { Loader2, LogOut, Monitor, Moon, Settings, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

const themeIcons = {
  dark: Moon,
  light: Sun,
  system: Monitor,
};

interface ProfileDropdownMenuProps {
  trigger: React.ReactNode;
  triggerAsChild?: boolean;
}

export const ProfileDropdownMenu: React.FC<ProfileDropdownMenuProps> = ({
  trigger,
  triggerAsChild = false,
}) => {
  const { t } = useTranslation();
  const [currentTheme, setCurrentTheme] = useAtom(themeAtom);
  const { isAuthenticated, loading: authLoading, signOut } = useAuth();

  const Icon = themeIcons[currentTheme];

  const { loading: isRedirectingToGoogleLogin, handleSignIn } =
    useGoogleSignIn();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="tw:focus-visible:ring-0"
        asChild={triggerAsChild}
      >
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent collisionPadding={8}>
        <Link to="/settings">
          <DropdownMenuItem>
            <Settings /> {t("nav:settings")}
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="tw:gap-2">
            <Icon className="tw:size-5 tw:text-muted-foreground" />
            {t("nav:darkMode")}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {THEMES.map((theme) => {
              const Icon = themeIcons[theme];
              return (
                <DropdownMenuItem
                  key={theme}
                  className={clsx(
                    "tw:capitalize tw:justify-between tw:not-last:mb-1",
                    theme === currentTheme &&
                      "tw:bg-primary! tw:text-primary-foreground!"
                  )}
                  onSelect={(e) => {
                    e.preventDefault();
                    setCurrentTheme(theme);
                  }}
                >
                  <span>
                    <Icon
                      className={clsx(
                        "tw:me-2 tw:inline-block",
                        theme === currentTheme && "tw:text-inherit"
                      )}
                    />
                    {t(`nav:${theme}`)}
                  </span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <LanguageSelector />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={isAuthenticated ? signOut : handleSignIn}
          disabled={authLoading || isRedirectingToGoogleLogin}
        >
          {!isAuthenticated && !authLoading ? (
            <>
              {isRedirectingToGoogleLogin ? (
                <Loader2 className="tw:animate-spin" />
              ) : (
                <>
                  <GoogleIcon className="tw:size-4" />
                  {t("nav:loginWithGoogle")}
                </>
              )}
            </>
          ) : (
            <>
              <LogOut /> {t("nav:logout")}
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
