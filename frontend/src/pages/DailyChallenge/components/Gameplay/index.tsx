import React, { useState } from "react";

import LoadingDialog from "@/components/recyclables/LoadingDialog";
import PokemonCombobox from "@/components/recyclables/PokemonCombobox";
import { Button } from "@/components/ui/Button";
import { usePokemonIcons } from "@/hooks/usePokemonIcons";
import DailyChallengeGuessBox from "@/pages/DailyChallenge/components/Gameplay/components/DailyChallengeGuessBox";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import clsx from "clsx";
import { Share2 } from "lucide-react";
import {
  challengeNumber,
  COLUMNS,
  DAILY_CHALLENGE_GUESS_LIMIT,
} from "../../constants";
import { useDailyChallengeData } from "../../hooks/useData";
import { shareResults } from "../../utils/share";
import GridItem from "./components/GridItem";
import styles from "./index.module.scss";

const DailyChallengeGameplay: React.FC = () => {
  const {
    onGuess,
    guesses,
    isLoading,
    hasSolved,
    hasReachedLimit,
    isGameFinished,
  } = useDailyChallengeData();
  const { getPokemonIcon } = usePokemonIcons();
  const [input, setInput] = useState("");

  const onSelectPokemon = (pokemon: PokemonNamesResponse) => {
    onGuess(pokemon).finally(() => setInput(""));
  };

  return (
    <div className="tw:flex tw:flex-col tw:flex-auto tw:max-w-[400px] tw:w-full">
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
      <div className="tw:grid tw:grid-flow-row tw:gap-2">
        {Array.from({
          length: isGameFinished
            ? guesses?.guesses.length ?? 0
            : DAILY_CHALLENGE_GUESS_LIMIT,
        }).map((_, i) => {
          const guess = guesses?.guesses[i];
          return <DailyChallengeGuessBox key={i} guess={guess} />;
        })}
      </div>
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
