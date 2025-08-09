import React, { useState } from "react";

import LoadingDialog from "@/components/recyclables/LoadingDialog";
import PokemonCombobox from "@/components/recyclables/PokemonCombobox";
import { usePokemonIcons } from "@/hooks/usePokemonIcons";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import clsx from "clsx";
import {
  Check,
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  ChevronUp,
  Equal,
  X,
} from "lucide-react";
import { DAILY_CHALLENGE_GUESS_LIMIT } from "../../constants";
import { useDailyChallengeData } from "../../hooks/useData";
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
        const pokemonId = guesses?.guesses[i]?.pokemonId;
        const pokemon = guesses?.guesses[i]?.pokemon;
        const Comp = pokemon ? PokeInfoPopover : React.Fragment;
        return (
          <Comp
            // These non-null assertion is fine because
            // we won't be needing them in React.Fragment
            pokemon={pokemon!}
            pokemonId={pokemonId!}
            key={i}
            guessOrder={i + 1}
          >
            <div
              className={clsx(
                styles["DailyChallengeGameplay__Grid"],
                pokemon &&
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
                    if (value === "<" || value === 0.5) {
                      icon = <ChevronDown />;
                    } else if (value === 0.25) {
                      icon = <ChevronsDown />;
                    } else if (value === 4) {
                      icon = <ChevronsUp />;
                    } else if (value === 1) {
                      icon = <Equal />;
                    } else if (value === false || value === 0) {
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
              {pokemonId && pokemon && <img src={getPokemonIcon(pokemonId)} />}
            </div>
          </Comp>
        );
      })}
      <div className="tw:mt-auto">
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
    </div>
  );
};

export default DailyChallengeGameplay;
