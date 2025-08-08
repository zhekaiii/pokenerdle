import { format } from "date-fns";
import React, { useState } from "react";

type DailyChallenge = {
  date: string;
  guesses: number[];
};

import PokemonCombobox from "@/components/recyclables/PokemonCombobox";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import clsx from "clsx";
import { useDailyChallengeData } from "../../hooks/useData";
import GridItem from "./components/GridItem";
import styles from "./index.module.scss";

const COLUMNS = ["Type 1", "Type 2", "Gen", "Color", "Height"] as const;

const DailyChallengeGameplay: React.FC = () => {
  const { isNewDay, setGuesses } = useDailyChallengeData();
  const [input, setInput] = useState("");

  if (isNewDay) {
    setGuesses({
      date: format(new Date(), "yyyy-MM-dd"),
      guesses: [],
    });
  }

  const onGuess = ({ id }: PokemonNamesResponse) => {
    setGuesses((prev) => ({
      date: format(new Date(), "yyyy-MM-dd"),
      guesses: [...prev!.guesses, id],
    }));
  };

  return (
    <div>
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
      <PokemonCombobox input={input} setInput={setInput} onSelect={onGuess} />
    </div>
  );
};

export default DailyChallengeGameplay;
