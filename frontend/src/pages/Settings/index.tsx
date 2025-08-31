import { themeAtom, THEMES } from "@/atoms/theme";
import { LanguageDropdownSelector } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { GoogleSignInButton } from "@/components/ui/GoogleSignInButton";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useAuth } from "@/hooks/useAuth";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import {
  IdCard,
  Languages,
  LogOut,
  Palette,
  Settings as SettingsIcon,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const displayNameAtom = atomWithStorage("display-name", "", undefined, {
  getOnInit: true,
});

const Settings: React.FC = () => {
  const { t } = useTranslation("settings");
  const { user, isAuthenticated, signOut } = useAuth();
  const [theme, setTheme] = useAtom(themeAtom);
  const [storedDisplayName, setStoredDisplayName] = useAtom(displayNameAtom);
  const [displayName, setDisplayName] = useState(storedDisplayName);

  const handleDisplayNameUpdate = async () => {
    if (!displayName.trim()) return;
    setStoredDisplayName(displayName.trim());
  };

  useEffect(() => {
    if (user && !displayName) {
      setStoredDisplayName(user.user_metadata.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run when user changes
  }, [user]);

  return (
    <div className="tw:max-w-2xl tw:mx-auto tw:p-6 tw:space-y-6">
      <div className="tw:flex tw:items-center tw:gap-2 tw:mb-6">
        <SettingsIcon className="tw:size-6" />
        <h1 className="tw:text-2xl tw:font-bold">{t("title")}</h1>
      </div>

      {/* Display Name Settings */}
      <Card responsive>
        <CardHeader>
          <div className="tw:flex tw:items-center tw:gap-3">
            <IdCard className="tw:size-5" />
            <h2 className="tw:text-lg tw:font-semibold">
              {t("displayName.title")}
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="tw:space-y-4">
            <div>
              <Label htmlFor="display-name">
                {t("displayName.label")}{" "}
                <span className="tw:text-muted-foreground tw:text-xs">
                  {t("displayName.pokechainNote")}
                </span>
              </Label>
              <div className="tw:flex tw:gap-2 tw:mt-1">
                <Input
                  id="display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t("displayName.placeholder")}
                  className="tw:flex-1"
                />
                <Button
                  onClick={handleDisplayNameUpdate}
                  disabled={!displayName.trim()}
                >
                  {t("displayName.updateButton")}
                </Button>
              </div>
              <p className="tw:text-sm tw:text-muted-foreground tw:mt-2">
                {t("displayName.description")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card responsive>
        <CardHeader>
          <div className="tw:flex tw:items-center tw:gap-3">
            <User className="tw:size-5" />
            <h2 className="tw:text-lg tw:font-semibold">
              {t("account.title")}
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          {isAuthenticated ? (
            <div className="tw:space-y-4">
              <div>
                <Label htmlFor="email">{t("account.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="tw:mt-1"
                />
              </div>

              <div className="tw:pt-4 tw:border-t">
                <Button variant="destructive" onClick={signOut}>
                  <LogOut />
                  {t("account.logoutButton")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="tw:flex tw:flex-col tw:items-center tw:gap-2">
              <p className="tw:text-muted-foreground">
                {t("account.signInPrompt")}
              </p>
              <GoogleSignInButton className="tw:w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card responsive>
        <CardHeader>
          <div className="tw:flex tw:items-center tw:gap-3">
            <Palette className="tw:size-5" />
            <h2 className="tw:text-lg tw:font-semibold">
              {t("appearance.title")}
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          <Label className="tw:block tw:mb-2">
            {t("appearance.themeMode")}
          </Label>
          <Tabs
            value={theme}
            onValueChange={(value) => setTheme(value as typeof theme)}
          >
            <TabsList className="tw:w-full">
              {THEMES.map((themeValue) => (
                <TabsTrigger
                  className="tw:capitalize tw:flex-1"
                  key={themeValue}
                  value={themeValue}
                >
                  {themeValue}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card responsive>
        <CardHeader>
          <div className="tw:flex tw:items-center tw:gap-3">
            <Languages className="tw:size-5" />
            <h2 className="tw:text-lg tw:font-semibold">
              {t("language.title")}
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          <LanguageDropdownSelector />
          <p className="tw:text-sm tw:text-muted-foreground tw:mt-2">
            {t("language.description")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export const Component = Settings;

Component.displayName = "Settings";

export default Component;
