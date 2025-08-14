import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { usePokemonIcons } from "@/hooks/usePokemonIcons";
import { usePokemonNames } from "@/hooks/usePokemonNames";
import { COLUMNS } from "@/pages/DailyChallenge/constants";
import {
  formatPokemonHeight,
  getFormattedPokemonName,
} from "@/utils/formatters";
import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import React, { memo, useState } from "react";
import { DailyChallengeGuessIcon } from "../../DailyChallengeGuessIcon";

import TypeChip from "@/components/recyclables/TypeChip";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import styles from "../index.module.scss";

type Props = {
  guess?: DailyChallengeGuessResponse;
  forceOpen?: boolean;
};

const DailyChallengeGuessBox: React.FC<Props> = ({ guess, forceOpen }) => {
  const { getPokemonIcon } = usePokemonIcons();
  const pokemonNames = usePokemonNames();
  const pokemonName = pokemonNames?.find((p) => p.id === guess?.pokemonId);
  const [isExpanded, setIsExpanded] = useState(false);
  const isOpen = isExpanded || forceOpen;
  const pokemonHeight = formatPokemonHeight(guess?.pokemon.height ?? 0);

  if (!guess) {
    return (
      <Card responsive className="tw:text-muted-foreground">
        <CardContent>Awaiting your guess...</CardContent>
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
            <img src={getPokemonIcon(guess.pokemonId)} />
            <div className="tw:flex tw:gap-4 tw:flex-grow">
              <div className="tw:flex tw:flex-col tw:flex-grow">
                <h3 className="tw:font-medium tw:text-lg">
                  {pokemonName && getFormattedPokemonName(pokemonName)}
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
                  {column.label}
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
              <li>You are correct!</li>
            ) : (
              <>
                <li>
                  {guess.type1Correctness === "=" ? (
                    <>
                      Target is also a{" "}
                      <TypeChip
                        className="tw:text-foreground"
                        type={guess.pokemon.type1}
                      />{" "}
                      type!
                    </>
                  ) : (
                    <>
                      <TypeChip
                        className="tw:text-foreground"
                        type={guess.pokemon.type1}
                      />{" "}
                      type moves deal {guess.type1Correctness}x damage against
                      the target.
                    </>
                  )}
                </li>
                <li>
                  {guess.type2Correctness === "=" ? (
                    <>
                      Target is also a{" "}
                      {guess.pokemon.type2 ? (
                        <TypeChip
                          className="tw:text-foreground"
                          type={guess.pokemon.type2}
                        />
                      ) : (
                        "mono"
                      )}{" "}
                      type!
                    </>
                  ) : guess.pokemon.type2 ? (
                    <>
                      <TypeChip
                        className="tw:text-foreground"
                        type={guess.pokemon.type2}
                      />{" "}
                      type moves deal {guess.type2Correctness}x damage against
                      the target.
                    </>
                  ) : (
                    "Target is not a monotype"
                  )}
                </li>
                <li>
                  {guess.genCorrectness === "=" ? (
                    <>Target is from the same generation!</>
                  ) : (
                    <>
                      Target is from{" "}
                      {guess.genCorrectness === "<" ? "an earlier" : "a later"}{" "}
                      generation.
                    </>
                  )}
                </li>
                <li>
                  {guess.colorCorrectness ? (
                    <>
                      Target is also {guess.pokemon.color.toLowerCase()} in
                      color!
                    </>
                  ) : (
                    <>
                      Target is not {guess.pokemon.color.toLowerCase()} in
                      color.
                    </>
                  )}
                </li>
                <li>
                  {guess.heightCorrectness === "=" ? (
                    <>Target is also {pokemonHeight} m tall!</>
                  ) : (
                    <>
                      Target is{" "}
                      {guess.heightCorrectness === "<" ? "shorter" : "taller"}{" "}
                      than {pokemonHeight}.
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
