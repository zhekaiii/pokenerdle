import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { TZDate } from "@date-fns/tz";
import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import { SINGAPORE_TIMEZONE } from "@pokenerdle/shared/date";
import { POKEMON_TYPES } from "@pokenerdle/shared/pokemon";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import clsx from "clsx";
import { format } from "date-fns";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { RotateCcw, Table } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TypeChart } from "../TypeChart/TypeChart";
import TypeChip from "../TypeChip";
import { DUAL_TYPE_ID, MONO_TYPE_ID } from "./utils";

const disabledTypesStorageAtom = atomWithStorage<{
  date: string;
  types: number[];
}>("dailyChallengeDisabledTypes", {
  date: format(TZDate.tz(SINGAPORE_TIMEZONE), "yyyy-MM-dd"),
  types: [],
});

const MONO_DUAL_TYPES = [
  { id: MONO_TYPE_ID, name: "monotype" },
  { id: DUAL_TYPE_ID, name: "dualtype" },
];

type TypeChecklistProps = React.ComponentProps<typeof Card> & {
  storageIdentifier?: string;
  guesses?: DailyChallengeGuessResponse[];
};

export const TypeChecklist: React.FC<TypeChecklistProps> = ({
  className,
  guesses = [],
  storageIdentifier,
  ...props
}) => {
  const { t } = useTranslation(["daily", "common"]);
  const [_disabledTypes, _setDisabledTypes] = useAtom(disabledTypesStorageAtom);
  const disabledTypes = useMemo(() => {
    if (_disabledTypes.date !== storageIdentifier) {
      return [];
    }
    return _disabledTypes.types;
  }, [_disabledTypes, storageIdentifier]);
  const setDisabledTypes = useCallback(
    (value: number[]) => {
      _setDisabledTypes({
        date: storageIdentifier ?? "",
        types: value,
      });
    },
    [_setDisabledTypes, storageIdentifier],
  );
  const [showTypeChart, setShowTypeChart] = useState(false);

  const clearDisabledTypes = () => {
    setDisabledTypes([]);
  };

  const toggleDisabledType = (id: number) => {
    setDisabledTypes(
      disabledTypes.includes(id)
        ? disabledTypes.filter((type) => type !== id)
        : [...disabledTypes, id],
    );
  };

  return (
    <Card responsive className={className} {...props}>
      <CardContent>
        <div className="tw:mb-2">
          <CardTitle className="tw:mb-1">{t("typeChecklist.title")}</CardTitle>
          <CardDescription>{t("typeChecklist.description")}</CardDescription>
        </div>
        {[POKEMON_TYPES, MONO_DUAL_TYPES].map((arr, index) => (
          <div
            key={index}
            className={clsx(
              "tw:flex tw:flex-wrap tw:gap-2 tw:justify-center",
              index === 0 && "tw:mb-2 tw:pointer-coarse:mb-3",
            )}
          >
            {arr.map(({ id, name }) => {
              return (
                <div key={id} className="tw:relative">
                  <TypeChip
                    clickable
                    className={clsx(
                      disabledTypes.includes(id) && "tw:opacity-30",
                    )}
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
        <div className="tw:flex tw:flex-wrap tw:gap-2 tw:justify-center tw:mt-4">
          <Dialog open={showTypeChart} onOpenChange={setShowTypeChart}>
            <DialogContent showCloseButton={false} className="tw:p-1">
              <VisuallyHidden>
                <DialogTitle>{t("typeChecklist.typeChart")}</DialogTitle>
              </VisuallyHidden>
              <TypeChart />
              <Button onClick={() => setShowTypeChart(false)}>
                {t("common:close")}
              </Button>
            </DialogContent>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Table /> {t("typeChecklist.typeChart")}
              </Button>
            </DialogTrigger>
          </Dialog>
          <Button onClick={clearDisabledTypes}>
            <RotateCcw />
            {t("typeChecklist.reset")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
