import { themeAtom, THEMES } from "@/atoms/theme";
import LinkButton from "@/components/recyclables/LinkButton";
import LoadingDialog from "@/components/recyclables/LoadingDialog";
import { Button } from "@/components/ui/Button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/Drawer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useAtom } from "jotai";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigation } from "react-router";
import RulePageButton from "./RulePageButton";

type Props = {
  trigger: React.ReactNode;
};

const NavDrawer: React.FC<Props> = ({ trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useAtom(themeAtom);
  const navigation = useNavigation();
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [navigation.state, location]);

  return (
    <Drawer direction="left" open={isOpen} onOpenChange={setIsOpen}>
      <LoadingDialog open={navigation.state === "loading"} />
      <DrawerTrigger className="tw:me-2">{trigger}</DrawerTrigger>
      <DrawerContent>
        <Button
          className="tw:ms-auto"
          variant="transparent"
          onClick={() => setIsOpen(false)}
        >
          <X className="tw:size-6" />
        </Button>
        <div className="tw:p-4 tw:flex tw:flex-col tw:gap-2">
          <LinkButton to="/daily">Daily Challenge</LinkButton>
          <LinkButton to="/pokechain">PokéChain</LinkButton>
          <LinkButton to="/path-finder">Path Finder</LinkButton>
          <RulePageButton />
        </div>
        <div className="tw:flex-grow" />
        <div className="tw:p-4">
          {/* @ts-expect-error -- The values are provided and we know it's safe */}
          <Tabs value={theme} onValueChange={setTheme}>
            <TabsList className="tw:w-full">
              {THEMES.map((value) => (
                <TabsTrigger
                  className="tw:capitalize tw:flex-grow"
                  key={value}
                  value={value}
                >
                  {value}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default NavDrawer;
