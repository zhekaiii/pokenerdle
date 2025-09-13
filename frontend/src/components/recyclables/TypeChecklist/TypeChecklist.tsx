import { Card, CardContent, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { TZDate } from "@date-fns/tz";
import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import { POKEMON_TYPES } from "@pokenerdle/shared/pokemon";
import clsx from "clsx";
import { formatDate } from "date-fns";
import { atom, useAtom, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import TypeChip from "../TypeChip";
import { DUAL_TYPE_ID, eliminateTypesFromGuesses, MONO_TYPE_ID } from "./utils";

const disabledTypesAtom = atom<number[]>([]);
const autoCalculateAtom = atomWithStorage<boolean>(
  "dailyChallengeAutoCalculate",
  false
);
export const autoCalculateLastUsedAtom = atomWithStorage<string | null>(
  "dailyChallengeAutoCalculateLastUsed",
  null
);

const MONO_DUAL_TYPES = [
  { id: MONO_TYPE_ID, name: "monotype" },
  { id: DUAL_TYPE_ID, name: "dualtype" },
];

type TypeChecklistProps = React.ComponentProps<typeof Card> & {
  guesses?: DailyChallengeGuessResponse[];
};

export const TypeChecklist: React.FC<TypeChecklistProps> = ({
  className,
  guesses = [],
  ...props
}) => {
  const { t } = useTranslation("daily");
  const [disabledTypes, setDisabledTypes] = useAtom(disabledTypesAtom);
  const [autoCalculate, setAutoCalculate] = useAtom(autoCalculateAtom);
  const setAutoCalculateLastUsed = useSetAtom(autoCalculateLastUsedAtom);

  useEffect(() => {
    if (!autoCalculate) {
      return;
    }
    setDisabledTypes(eliminateTypesFromGuesses(guesses));
  }, [autoCalculate, guesses, setDisabledTypes]);

  const toggleDisabledType = (id: number) => {
    setDisabledTypes((prev) =>
      prev.includes(id) ? prev.filter((type) => type !== id) : [...prev, id]
    );
  };

  const hasGuess = guesses.length > 0;
  useEffect(() => {
    if (autoCalculate && hasGuess) {
      setAutoCalculateLastUsed(
        formatDate(TZDate.tz("Asia/Singapore"), "yyyy-MM-dd")
      );
    }
  }, [autoCalculate, hasGuess, setAutoCalculateLastUsed]);

  return (
    <Card responsive className={className} {...props}>
      <CardContent>
        <div className="tw:flex tw:justify-between tw:gap-2">
          <CardTitle>{t("typeChecklist.title")}</CardTitle>
          <div className="tw:flex tw:items-center tw:mb-4">
            <Switch
              id="easy-mode-switch"
              className="tw:me-2"
              checked={autoCalculate}
              onCheckedChange={setAutoCalculate}
            />
            <Label htmlFor="easy-mode-switch">
              {t("typeChecklist.autoCalculate")}
            </Label>
          </div>
        </div>
        {[POKEMON_TYPES, MONO_DUAL_TYPES].map((arr, index) => (
          <div
            key={index}
            className="tw:flex tw:flex-wrap tw:gap-2 tw:justify-center tw:last:mt-2"
          >
            {arr.map(({ id, name }) => {
              return (
                <div key={id} className="tw:relative">
                  <TypeChip
                    className={clsx(
                      disabledTypes.includes(id) && "tw:opacity-30"
                    )}
                    {...(!autoCalculate && {
                      role: "button",
                      onClick: () => toggleDisabledType(id),
                    })}
                    type={name}
                  />
                  {disabledTypes.includes(id) && (
                    <div className="tw:absolute tw:top-1/2 tw:inset-x-1 tw:border-t-1 tw:border-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
