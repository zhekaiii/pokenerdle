import React, { useState } from "react";

import LoadingDialog from "@/components/recyclables/LoadingDialog";
import PokemonCombobox from "@/components/recyclables/PokemonCombobox";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import clsx from "clsx";
import { useDailyChallengeData } from "../../hooks/useData";
import GridItem from "./components/GridItem";
import styles from "./index.module.scss";

const COLUMNS = ["Type 1", "Type 2", "Gen", "Color", "Height"] as const;

const DailyChallengeGameplay: React.FC = () => {
  const { onGuess, guesses, isLoading } = useDailyChallengeData();
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
            key={column}
            className={clsx(
              styles["DailyChallengeGameplay__GridItem"],
              styles[`DailyChallengeGameplay__GridItem--header`]
            )}
          >
            {column}
          </div>
        ))}
        {Array.from({ length: 25 }).map((_, i) => (
          <GridItem key={i}>{null}</GridItem>
        ))}
      </div>
      <PokemonCombobox
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
    </div>
  );
};

export default DailyChallengeGameplay;
