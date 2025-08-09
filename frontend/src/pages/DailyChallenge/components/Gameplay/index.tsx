import React, { useState } from "react";

import LoadingDialog from "@/components/recyclables/LoadingDialog";
import PokemonCombobox from "@/components/recyclables/PokemonCombobox";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import clsx from "clsx";
import {
  Ban,
  Check,
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  ChevronUp,
  Minus,
  X,
} from "lucide-react";
import { DAILY_CHALLENGE_GUESS_LIMIT } from "../../constants";
import { useDailyChallengeData } from "../../hooks/useData";
import GridItem from "./components/GridItem";
import styles from "./index.module.scss";

const COLUMNS = [
  { label: "Type 1", key: "type1Correctness" },
  { label: "Type 2", key: "type2Correctness" },
  { label: "Gen", key: "genCorrectness" },
  { label: "Color", key: "colorCorrectness" },
  { label: "Height", key: "heightCorrectness" },
] as const;

const DailyChallengeGameplay: React.FC = () => {
  const { onGuess, guesses, isLoading, hasSolved, hasReachedLimit } =
    useDailyChallengeData();
  const [input, setInput] = useState("");

  const onSelectPokemon = (pokemon: PokemonNamesResponse) => {
    onGuess(pokemon).finally(() => setInput(""));
  };

  return (
    <div>
      <LoadingDialog open={isLoading} />
      <div className={clsx(styles["DailyChallengeGameplay__Grid"], "tw:mb-4")}>
        {COLUMNS.map((column) => (
          <div
            key={column.key}
            className={clsx(
              styles["DailyChallengeGameplay__GridItem"],
              styles[`DailyChallengeGameplay__GridItem--header`]
            )}
          >
            {column.label}
          </div>
        ))}
        {Array.from({ length: DAILY_CHALLENGE_GUESS_LIMIT }).map((_, i) => (
          <React.Fragment key={i}>
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
                  if (value === "<" || value === 0.5) {
                    icon = <ChevronDown />;
                  } else if (value === 0.25) {
                    icon = <ChevronsDown />;
                  } else if (value === 4) {
                    icon = <ChevronsUp />;
                  } else if (value === 0) {
                    icon = <Ban />;
                  } else if (value === 1) {
                    icon = <Minus />;
                  } else if (!value) {
                    icon = <X />;
                  } else {
                    icon = <ChevronUp />;
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
          </React.Fragment>
        ))}
      </div>
      {!hasReachedLimit && (
        <PokemonCombobox
          disabled={hasSolved || isLoading}
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
      )}
    </div>
  );
};

export default DailyChallengeGameplay;
