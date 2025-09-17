import useMedia from "@/hooks/useMedia";
import EffectivenessIcon from "@/pages/DailyChallenge/components/EffectivenessIcon";
import { POKEMON_TYPES } from "@pokenerdle/shared/pokemon";
import clsx from "clsx";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import TypeChip from "../TypeChip";
import _EFFECTIVENESS from "./effectiveness.json";
import styles from "./index.module.scss";

const EFFECTIVENESS_MAP = _EFFECTIVENESS as Record<
  string,
  Record<string, number>
>;

export const TypeChart: React.FC = () => {
  const { t } = useTranslation(["daily"]);
  const isMobile = useMedia("(pointer:coarse)");
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);
  const [highlightedColumn, setHighlightedColumn] = useState<number | null>(
    null
  );

  const shouldDimCell = (attackingType: number, defendingType: number) => {
    if (highlightedColumn && highlightedRow) {
      return (
        highlightedColumn !== defendingType && highlightedRow !== attackingType
      );
    }
    if (highlightedColumn) {
      return highlightedColumn !== defendingType;
    }
    if (highlightedRow) {
      return highlightedRow !== attackingType;
    }
    return false;
  };

  const toggleHighlight = (attackingType: number, defendingType: number) => {
    if (
      highlightedRow === attackingType &&
      highlightedColumn === defendingType
    ) {
      setHighlightedRow(null);
      setHighlightedColumn(null);
    } else {
      setHighlightedRow(attackingType);
      setHighlightedColumn(defendingType);
    }
  };

  const toggleHighlightRow = (attackingType: number) => {
    if (highlightedRow === attackingType) {
      setHighlightedRow(null);
    } else {
      setHighlightedRow(attackingType);
    }
  };

  const toggleHighlightColumn = (defendingType: number) => {
    if (highlightedColumn === defendingType) {
      setHighlightedColumn(null);
    } else {
      setHighlightedColumn(defendingType);
    }
  };

  return (
    <div className="tw:overflow-auto tw:max-h-[calc(90dvh-5rem)]">
      <table className={styles.typeChart}>
        <thead>
          <tr>
            <th>
              <div className="tw:justify-end">
                {t("typeChecklist.defending")} <ArrowRight />
              </div>
              <div className="tw:justify-end">
                {t("typeChecklist.attacking")} <ArrowDown />
              </div>
            </th>
            {POKEMON_TYPES.map((type) => (
              <th
                key={type.id}
                {...(isMobile
                  ? {
                      onClick: () => setHighlightedColumn(type.id),
                    }
                  : {
                      onMouseEnter: () => setHighlightedColumn(type.id),
                      onMouseLeave: () => setHighlightedColumn(null),
                    })}
              >
                <div
                  className={clsx(
                    "tw:flex tw:h-full",
                    highlightedColumn &&
                      highlightedColumn !== type.id &&
                      "tw:opacity-30"
                  )}
                >
                  <TypeChip type={type.name} />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {POKEMON_TYPES.map((attackingType) => (
            <tr key={attackingType.id}>
              <th
                {...(isMobile
                  ? {
                      onClick: () => toggleHighlightRow(attackingType.id),
                    }
                  : {
                      onMouseEnter: () => setHighlightedRow(attackingType.id),
                      onMouseLeave: () => setHighlightedRow(null),
                    })}
              >
                <TypeChip
                  className={clsx(
                    highlightedRow &&
                      highlightedRow !== attackingType.id &&
                      "tw:opacity-30"
                  )}
                  type={attackingType.name}
                />
              </th>
              {POKEMON_TYPES.map((defendingType) => {
                const effectiveness =
                  EFFECTIVENESS_MAP[attackingType.id.toString()][
                    defendingType.id.toString()
                  ];
                return (
                  <td
                    key={defendingType.id}
                    className={clsx(
                      effectiveness < 1 &&
                        "tw:bg-destructive tw:text-destructive-foreground",
                      effectiveness > 1 &&
                        "tw:bg-positive tw:text-positive-foreground",
                      shouldDimCell(attackingType.id, defendingType.id) &&
                        "tw:opacity-30"
                    )}
                    {...(isMobile
                      ? {
                          onClick: () =>
                            toggleHighlight(attackingType.id, defendingType.id),
                        }
                      : {
                          onMouseEnter: () => {
                            setHighlightedColumn(defendingType.id);
                            setHighlightedRow(attackingType.id);
                          },
                          onMouseLeave: () => {
                            setHighlightedColumn(null);
                            setHighlightedRow(null);
                          },
                        })}
                  >
                    <EffectivenessIcon value={effectiveness} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
