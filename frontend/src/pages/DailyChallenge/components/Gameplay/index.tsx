import React, { useState } from "react";

import LoadingDialog from "@/components/recyclables/LoadingDialog";
import PokemonCombobox from "@/components/recyclables/PokemonCombobox";
import { Button } from "@/components/ui/Button";
import { usePokemonIcons } from "@/hooks/usePokemonIcons";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import clsx from "clsx";
import { Check, ChevronDown, ChevronUp, Share2, X } from "lucide-react";
import { challengeNumber, DAILY_CHALLENGE_GUESS_LIMIT } from "../../constants";
import { useDailyChallengeData } from "../../hooks/useData";
import { shareResults } from "../../utils/share";
import EffectivenessIcon from "../EffectivenessIcon";
import GridItem from "./components/GridItem";
import PokeInfoPopover from "./components/PokeInfoPopover";
import styles from "./index.module.scss";

export const COLUMNS = [
  { label: "Type 1", key: "type1Correctness" },
  { label: "Type 2", key: "type2Correctness" },
  { label: "Gen", key: "genCorrectness" },
  { label: "Color", key: "colorCorrectness" },
  { label: "Height", key: "heightCorrectness" },
] as const;

const DailyChallengeGameplay: React.FC = () => {
  const { onGuess, guesses, isLoading, hasSolved, hasReachedLimit } =
    useDailyChallengeData();
  const { getPokemonIcon } = usePokemonIcons();
  const [input, setInput] = useState("");

  const onSelectPokemon = (pokemon: PokemonNamesResponse) => {
    onGuess(pokemon).finally(() => setInput(""));
  };

  return (
    <div className="tw:flex tw:flex-col tw:flex-auto tw:max-w-[365px] tw:w-full">
      <LoadingDialog open={isLoading} />
      <h2 className="tw:text-center tw:mb-1 tw:font-medium tw:text-lg">
        Daily Challenge #{challengeNumber}
      </h2>
      <div
        className={clsx(
          styles["DailyChallengeGameplay__Grid"],
          styles["DailyChallengeGameplay__Grid--header"]
        )}
      >
        {COLUMNS.map((column) => (
          <GridItem
            key={column.key}
            className={styles[`DailyChallengeGameplay__GridItem`]}
          >
            {column.label}
          </GridItem>
        ))}
      </div>
      {Array.from({ length: DAILY_CHALLENGE_GUESS_LIMIT }).map((_, i) => {
        const guess = guesses?.guesses[i];
        const Wrapper = ({ children }: { children: React.ReactNode }) =>
          guess ? (
            <PokeInfoPopover guess={guess} guessOrder={i + 1}>
              {children}
            </PokeInfoPopover>
          ) : (
            <>{children}</>
          );
        return (
          <Wrapper key={i}>
            <div
              className={clsx(
                styles["DailyChallengeGameplay__Grid"],
                guess &&
                  "tw:transition-transform tw:hover:scale-105 tw:cursor-pointer"
              )}
            >
              {COLUMNS.map((column) => {
                const classNames: string[] = [];
                let icon: React.ReactNode = null;
                if (guesses?.guesses[i]) {
                  if (
                    "correct" in guesses.guesses[i] ||
                    guesses.guesses[i][column.key] == "="
                  ) {
                    classNames.push(
                      styles["DailyChallengeGameplay__GridItem--correct"]
                    );
                    icon = <Check />;
                  } else {
                    const value = guesses.guesses[i][column.key];
                    if (value === "<") {
                      icon = <ChevronDown />;
                    } else if (value === false) {
                      icon = <X />;
                    } else if (value === ">") {
                      icon = <ChevronUp />;
                    } else if (value === true || value === "=") {
                      icon = <Check />;
                    } else {
                      icon = <EffectivenessIcon value={value} />;
                    }
                    classNames.push(
                      styles["DailyChallengeGameplay__GridItem--incorrect"]
                    );
                  }
                }
                return (
                  <GridItem className={clsx(classNames)} key={column.key}>
                    {icon}
                  </GridItem>
                );
              })}
              {guess && <img src={getPokemonIcon(guess.pokemonId)} />}
            </div>
          </Wrapper>
        );
      })}
      {!hasReachedLimit && !hasSolved ? (
        <>
          <div className="tw:mb-[50px]" />
          <PokemonCombobox
            className={styles.DailyChallengeInput}
            disabled={isLoading}
            input={input}
            setInput={setInput}
            onSelect={onSelectPokemon}
            filter={
              guesses
                ? (p) =>
                    !guesses.guesses
                      .map(({ pokemonId }) => pokemonId)
                      .includes(p.id)
                : undefined
            }
          />
        </>
      ) : (
        <Button
          className="tw:w-full tw:mt-auto"
          onClick={() => shareResults(guesses?.guesses ?? [])}
        >
          Share <Share2 />
        </Button>
      )}
    </div>
  );
};

export default DailyChallengeGameplay;
