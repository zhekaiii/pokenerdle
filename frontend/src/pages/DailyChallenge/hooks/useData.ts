import { useLocalStorage } from "react-use";

import { DAILY_CHALLENGE_KEY } from "../constants";

import api from "@/api";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import { format, formatDate } from "date-fns";
import { produce } from "immer";
import { useCallback, useState } from "react";

export type DailyChallenge = {
  date: string;
  guesses: (DailyChallengeGuessResponse & { pokemonId: number })[];
};

const now = new Date();

export const useDailyChallengeData = () => {
  const [guesses, setGuesses] = useLocalStorage<DailyChallenge | null>(
    DAILY_CHALLENGE_KEY,
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const isNewDay = guesses?.date !== format(now, "yyyy-MM-dd");

  if (isNewDay) {
    setGuesses({
      date: format(now, "yyyy-MM-dd"),
      guesses: [],
    });
  }

  const onGuess = useCallback(async ({ id }: PokemonNamesResponse) => {
    try {
      setIsLoading(true);
      const response = await api.daily.verifyGuess(id);
      setGuesses((prev) =>
        produce(prev, (draft) => {
          const guess = {
            ...response,
            pokemonId: id,
          };
          if (draft) {
            draft.guesses.push(guess);
            return;
          }
          return {
            date: formatDate(new Date(), "yyyy-MM-dd"),
            guesses: [guess],
          };
        })
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isNewDay,
    guesses,
    onGuess,
    isLoading,
  };
};
