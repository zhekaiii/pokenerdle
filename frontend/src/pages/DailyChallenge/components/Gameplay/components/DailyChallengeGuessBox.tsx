import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { usePokemonIcons } from "@/hooks/usePokemonIcons";
import { usePokemonNames } from "@/hooks/usePokemonNames";
import { COLUMNS } from "@/pages/DailyChallenge/constants";
import { formatPokemonHeight } from "@/utils/formatters";
import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import React, { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DailyChallengeGuessIcon } from "../../DailyChallengeGuessIcon";

import placeholderIcon from "@/assets/question_mark.png";

import TypeChip from "@/components/recyclables/TypeChip";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import styles from "../index.module.scss";

type Props = {
  guess?: DailyChallengeGuessResponse;
  forceOpen?: boolean;
};

const DailyChallengeGuessBox: React.FC<Props> = ({ guess, forceOpen }) => {
  const { t } = useTranslation("daily");
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
                  Gen {guess.pokemon.generationId} &bull; {pokemonHeight} &bull;{" "}
                  {guess.pokemon.color}
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
                    <>
                      {t("guessDetails.typeAlso")}{" "}
                      <TypeChip type={guess.pokemon.type1} />{" "}
                      {t("guessDetails.type")}
                    </>
                  ) : (
                    <>
                      <TypeChip type={guess.pokemon.type1} />{" "}
                      {t("guessDetails.typeMovesDeal")} {guess.type1Correctness}
                      {t("guessDetails.damageAgainstTarget")}
                    </>
                  )}
                </li>
                <li>
                  {guess.type2Correctness === "=" ? (
                    <>
                      {t("guessDetails.typeAlso")}{" "}
                      {guess.pokemon.type2 ? (
                        <TypeChip type={guess.pokemon.type2} />
                      ) : (
                        t("guessDetails.mono")
                      )}{" "}
                      {t("guessDetails.type")}
                    </>
                  ) : guess.pokemon.type2 ? (
                    <>
                      <TypeChip type={guess.pokemon.type2} />{" "}
                      {t("guessDetails.typeMovesDeal")} {guess.type2Correctness}
                      {t("guessDetails.damageAgainstTarget")}
                    </>
                  ) : (
                    t("guessDetails.notMonotype")
                  )}
                </li>
                <li>
                  {guess.genCorrectness === "=" ? (
                    <>{t("guessDetails.sameGeneration")}</>
                  ) : (
                    <>
                      {t("guessDetails.fromGeneration")}{" "}
                      {guess.genCorrectness === "<"
                        ? t("guessDetails.earlier")
                        : t("guessDetails.later")}{" "}
                      {t("guessDetails.generation")}
                    </>
                  )}
                </li>
                <li>
                  {guess.colorCorrectness ? (
                    <>
                      {t("guessDetails.alsoColor")}{" "}
                      {guess.pokemon.color.toLowerCase()}{" "}
                      {t("guessDetails.inColor")}
                    </>
                  ) : (
                    <>
                      {t("guessDetails.notColor")}{" "}
                      {guess.pokemon.color.toLowerCase()}{" "}
                      {t("guessDetails.notInColor")}
                    </>
                  )}
                </li>
                <li>
                  {guess.heightCorrectness === "=" ? (
                    <>
                      {t("guessDetails.alsoHeight")} {pokemonHeight}{" "}
                      {t("guessDetails.mTall")}
                    </>
                  ) : (
                    <>
                      {t("guessDetails.isHeight")}{" "}
                      {guess.heightCorrectness === "<"
                        ? t("guessDetails.shorter")
                        : t("guessDetails.taller")}{" "}
                      {t("guessDetails.than")} {pokemonHeight}.
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
