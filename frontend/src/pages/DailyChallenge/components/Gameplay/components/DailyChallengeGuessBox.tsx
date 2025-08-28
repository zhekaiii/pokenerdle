import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { usePokemonIcons } from "@/hooks/usePokemonIcons";
import { usePokemonNames } from "@/hooks/usePokemonNames";
import { COLUMNS } from "@/pages/DailyChallenge/constants";
import { formatPokemonHeight } from "@/utils/formatters";
import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import React, { memo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { DailyChallengeGuessIcon } from "../../DailyChallengeGuessIcon";

import placeholderIcon from "@/assets/question_mark.png";

import TypeChip from "@/components/recyclables/TypeChip";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import styles from "../index.module.scss";

interface Props {
  guess?: DailyChallengeGuessResponse;
  forceOpen?: boolean;
}

const DailyChallengeGuessBox: React.FC<Props> = ({ guess, forceOpen }) => {
  const { t } = useTranslation(["daily", "pokemon"]);
  const { getPokemonIcon } = usePokemonIcons();
  const pokemonNames = usePokemonNames();
  const pokemonName =
    guess?.pokemonId != undefined ? pokemonNames[guess.pokemonId] : undefined;
  const [isExpanded, setIsExpanded] = useState(false);
  const isOpen = isExpanded || forceOpen;
  const pokemonHeight = formatPokemonHeight(guess?.pokemon.height ?? 0);

  if (!guess) {
    return (
      <Card responsive className="tw:text-muted-foreground">
        <CardContent>{t("guessBox.awaitingGuess")}</CardContent>
      </Card>
    );
  }

  return (
    <Card
      responsive
      onClick={() => setIsExpanded((value) => !value)}
      className={
        forceOpen
          ? ""
          : "tw:hover:bg-muted tw:transition-colors tw:cursor-pointer"
      }
    >
      <CardHeader className="tw:flex tw:items-center">
        <div className="tw:grow">
          <div className="tw:flex tw:items-center">
            <img
              src={getPokemonIcon(guess.pokemonId)}
              onError={(e) => {
                e.currentTarget.src = placeholderIcon;
              }}
              alt={pokemonName?.name || pokemonName?.speciesName}
              className={styles.PokemonIcon}
            />
            <div className="tw:flex tw:gap-4 tw:flex-grow">
              <div className="tw:flex tw:flex-col tw:flex-grow">
                <h3 className="tw:font-medium tw:text-lg">
                  {pokemonName?.name || pokemonName?.speciesName}
                </h3>
                <div className="tw:text-muted-foreground tw:text-sm">
                  {t("pokemon:genX", {
                    gen: guess.pokemon.generationId,
                  })}{" "}
                  &bull; {t("pokemon:height", { height: pokemonHeight })} &bull;{" "}
                  {t(`colors.${guess.pokemon.color}`)}
                </div>
              </div>
              <div className="tw:flex tw:flex-col tw:ms-auto">
                <TypeChip type={guess.pokemon.type1} />
                {guess.pokemon.type2 && (
                  <TypeChip className="tw:mt-1" type={guess.pokemon.type2} />
                )}
              </div>
            </div>
          </div>
          <div
            className={clsx("tw:mt-2", styles["DailyChallengeGameplay__Grid"])}
          >
            {COLUMNS.map((column) => (
              <div
                key={column.key}
                className={clsx(
                  styles["DailyChallengeGameplay__GridItem"],
                  guess.correct ||
                    guess[column.key] === "=" ||
                    guess[column.key] === true
                    ? styles["DailyChallengeGameplay__GridItem--correct"]
                    : styles["DailyChallengeGameplay__GridItem--incorrect"]
                )}
              >
                <span className={styles["DailyChallengeGameplay__GridHeader"]}>
                  {t(column.label)}
                </span>
                <DailyChallengeGuessIcon guess={guess} colKey={column.key} />
              </div>
            ))}
          </div>
        </div>
        {!forceOpen && (
          <ChevronDown
            className={clsx(
              "tw:sm:ms-1 tw:-me-3 tw:transition-transform",
              isExpanded && "tw:-rotate-180"
            )}
          />
        )}
      </CardHeader>
      {isOpen && (
        <CardContent className="tw:text-muted-foreground">
          <ul className="tw:list-disc tw:ps-6">
            {guess.correct ? (
              <li>{t("guessDetails.correct")}</li>
            ) : (
              <>
                <li>
                  {guess.type1Correctness === "=" ? (
                    <Trans
                      ns="daily"
                      i18nKey="guessDetails.type.correct"
                      components={{
                        type: <TypeChip type={guess.pokemon.type1} />,
                      }}
                    />
                  ) : (
                    <Trans
                      ns="daily"
                      i18nKey="guessDetails.type.incorrect"
                      count={guess.type1Correctness}
                      components={{
                        type: <TypeChip type={guess.pokemon.type1} />,
                      }}
                    />
                  )}
                </li>
                <li>
                  {guess.type2Correctness === "=" ? (
                    <>
                      {guess.pokemon.type2 ? (
                        <Trans
                          ns="daily"
                          i18nKey="guessDetails.type.correct"
                          components={{
                            type: <TypeChip type={guess.pokemon.type2} />,
                          }}
                        />
                      ) : (
                        t("guessDetails.type.alsoMono")
                      )}
                    </>
                  ) : guess.pokemon.type2 ? (
                    <Trans
                      ns="daily"
                      i18nKey="guessDetails.type.incorrect"
                      count={guess.type2Correctness as number}
                      components={{
                        type: <TypeChip type={guess.pokemon.type2} />,
                      }}
                    />
                  ) : (
                    t("guessDetails.type.notMonotype")
                  )}
                </li>
                <li>
                  {guess.genCorrectness === "=" ? (
                    <>{t("guessDetails.generation.correct")}</>
                  ) : (
                    <>
                      {guess.genCorrectness === "<"
                        ? t("guessDetails.generation.earlier")
                        : t("guessDetails.generation.later")}
                    </>
                  )}
                </li>
                <li>
                  {guess.colorCorrectness ? (
                    <>
                      {t("guessDetails.color.correct", {
                        color: t(`colors.${guess.pokemon.color}`).toLowerCase(),
                      })}
                    </>
                  ) : (
                    <>
                      {t("guessDetails.color.incorrect", {
                        color: t(`colors.${guess.pokemon.color}`).toLowerCase(),
                      })}
                    </>
                  )}
                </li>
                <li>
                  {guess.heightCorrectness === "=" ? (
                    <>
                      {t("guessDetails.height.correct", {
                        height: pokemonHeight,
                      })}
                    </>
                  ) : (
                    <>
                      {guess.heightCorrectness === "<"
                        ? t("guessDetails.height.shorter", {
                            height: pokemonHeight,
                          })
                        : t("guessDetails.height.taller", {
                            height: pokemonHeight,
                          })}
                    </>
                  )}
                </li>
              </>
            )}
          </ul>
        </CardContent>
      )}
    </Card>
  );
};

export default DailyChallengeGuessBox;

/**
 * Memoized version of the component. Note that we only look at the
 * pokemonId prop!
 */
export const DailyChallengeGuessBoxMemo = memo(
  DailyChallengeGuessBox,
  (prev, next) => prev.guess?.pokemonId === next.guess?.pokemonId
);
