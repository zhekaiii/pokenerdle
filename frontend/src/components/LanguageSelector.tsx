import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/DropdownMenu";
import clsx from "clsx";
import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/Select";

const languages = [
  { code: "en", name: "English" },
  { code: "zh-Hans", name: "简体中文", beta: true },
  { code: "zh-Hant", name: "繁体中文", beta: true },
];

export const LanguageDropdownSelector: React.FC = () => {
  const { i18n } = useTranslation();
  return (
    <Select value={i18n.language} onValueChange={i18n.changeLanguage}>
      <SelectTrigger>
        <SelectValue placeholder="Select a language" />
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            {language.name}
            {language.beta && (
              <span className="tw:text-xs tw:text-muted-foreground tw:ms-auto">
                Beta
              </span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export const LanguageDropdownSubmenu: React.FC = () => {
  const { i18n, t } = useTranslation("nav");

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Languages className="tw:text-muted-foreground tw:me-2" />{" "}
        {t("language")}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => i18n.changeLanguage(language.code)}
            className={clsx(
              i18n.language === language.code &&
                "tw:bg-primary! tw:text-primary-foreground!",
              "tw:not-last:mb-1"
            )}
          >
            {language.name}
            {language.beta && (
              <span className="tw:text-xs tw:text-muted-foreground tw:ms-auto">
                Beta
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};
