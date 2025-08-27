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
import { useAtom } from "jotai";
import {
  Check,
  Loader2,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

const themeIcons = {
  dark: Moon,
  light: Sun,
  system: Monitor,
};

type ProfileDropdownMenuProps = {
  trigger: React.ReactNode;
  triggerAsChild?: boolean;
};

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
                  className="tw:capitalize tw:justify-between"
                  onSelect={(e) => {
                    e.preventDefault();
                    setCurrentTheme(theme);
                  }}
                >
                  <span>
                    <Icon className="tw:me-2 tw:inline-block" />
                    {t(`nav:${theme}`)}
                  </span>
                  {theme === currentTheme && <Check />}
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
