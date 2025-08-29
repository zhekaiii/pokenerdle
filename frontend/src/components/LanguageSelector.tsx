import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/DropdownMenu";
import clsx from "clsx";
import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", name: "English" },
  { code: "zh", name: "中文", beta: true },
];

const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Languages className="tw:text-muted-foreground tw:me-2" />{" "}
        {t("nav:language")}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={clsx(
              i18n.resolvedLanguage === language.code &&
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

export default LanguageSelector;
