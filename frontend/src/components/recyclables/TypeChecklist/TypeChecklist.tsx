import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/Card";
import { FROZEN_DATE } from "@/pages/DailyChallenge/constants";
import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import { POKEMON_TYPES } from "@pokenerdle/shared/pokemon";
import clsx from "clsx";
import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import TypeChip from "../TypeChip";
import { DUAL_TYPE_ID, MONO_TYPE_ID } from "./utils";

const disabledTypesStorageAtom = atomWithStorage<{
  date: string;
  types: number[];
}>("dailyChallengeDisabledTypes", {
  date: FROZEN_DATE,
  types: [],
});
const disabledTypesAtom = atom(
  (get) => {
    const { date, types } = get(disabledTypesStorageAtom);
    if (date === FROZEN_DATE) {
      return types;
    }
    return [];
  },
  (_, set, value: number[]) => {
    set(disabledTypesStorageAtom, {
      date: FROZEN_DATE,
      types: value,
    });
  }
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

  const clearDisabledTypes = () => {
    setDisabledTypes([]);
  };

  const toggleDisabledType = (id: number) => {
    setDisabledTypes(
      disabledTypes.includes(id)
        ? disabledTypes.filter((type) => type !== id)
        : [...disabledTypes, id]
    );
  };

  return (
    <Card responsive className={className} {...props}>
      <CardContent>
        <div className="tw:mb-2">
          <CardTitle>{t("typeChecklist.title")}</CardTitle>
          <CardDescription>{t("typeChecklist.description")}</CardDescription>
        </div>
        {[POKEMON_TYPES, MONO_DUAL_TYPES].map((arr, index) => (
          <div
            key={index}
            className={clsx(
              "tw:flex tw:flex-wrap tw:gap-2 tw:justify-center",
              index === 0 && "tw:mb-2"
            )}
          >
            {arr.map(({ id, name }) => {
              return (
                <div key={id} className="tw:relative">
                  <TypeChip
                    className={clsx(
                      disabledTypes.includes(id) && "tw:opacity-30"
                    )}
                    role="button"
                    onClick={() => toggleDisabledType(id)}
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
        <Button
          className="tw:mx-auto tw:flex tw:mt-4"
          onClick={clearDisabledTypes}
        >
          <RotateCcw />
          {t("typeChecklist.reset")}
        </Button>
      </CardContent>
    </Card>
  );
};
