import { themeAtom, THEMES } from "@/atoms/theme";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { GoogleSignInButton } from "@/components/ui/GoogleSignInButton";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useAuth } from "@/hooks/useAuth";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { LogOut, Palette, Settings as SettingsIcon, User } from "lucide-react";
import React, { useEffect, useState } from "react";

const displayNameAtom = atomWithStorage("display-name", "", undefined, {
  getOnInit: true,
});

const Settings: React.FC = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const [theme, setTheme] = useAtom(themeAtom);
  const [storedDisplayName, setStoredDisplayName] = useAtom(displayNameAtom);
  const [displayName, setDisplayName] = useState(storedDisplayName);

  const handleDisplayNameUpdate = async () => {
    if (!user || !displayName.trim()) return;
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
        <h1 className="tw:text-2xl tw:font-bold">Settings</h1>
      </div>

      {/* Account Information */}
      <Card responsive>
        <CardHeader>
          <div className="tw:flex tw:items-center tw:gap-3">
            <User className="tw:size-5" />
            <h2 className="tw:text-lg tw:font-semibold">Account Information</h2>
          </div>
        </CardHeader>
        <CardContent>
          {isAuthenticated ? (
            <div className="tw:space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="tw:mt-1"
                />
              </div>

              <div>
                <Label htmlFor="display-name">
                  Display Name{" "}
                  <span className="tw:text-muted-foreground tw:text-xs">
                    (for PokéChain)
                  </span>
                </Label>
                <div className="tw:flex tw:gap-2 tw:mt-1">
                  <Input
                    id="display-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    className="tw:flex-1"
                  />
                  <Button
                    onClick={handleDisplayNameUpdate}
                    disabled={!displayName.trim()}
                  >
                    Update
                  </Button>
                </div>
              </div>

              <div className="tw:pt-4 tw:border-t">
                <Button variant="destructive" onClick={signOut}>
                  <LogOut />
                  Log Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="tw:flex tw:flex-col tw:items-center tw:gap-2">
              <p className="tw:text-muted-foreground">
                Sign in to manage your account settings.
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
            <h2 className="tw:text-lg tw:font-semibold">Appearance</h2>
          </div>
        </CardHeader>
        <CardContent>
          <Label className="tw:block tw:mb-2">Theme Mode</Label>
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
    </div>
  );
};

export const Component = Settings;

Component.displayName = "Settings";

export default Component;
