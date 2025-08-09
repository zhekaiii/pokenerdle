import { useLocalStorage } from "react-use";

import { DAILY_CHALLENGE_GUESS_LIMIT, DAILY_CHALLENGE_KEY } from "../constants";

import api from "@/api";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import { format, formatDate } from "date-fns";
import { useMemo, useState } from "react";

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
  const hasSolved = useMemo(
    () =>
      Boolean(
        guesses &&
          guesses.guesses.length &&
          guesses.guesses[guesses.guesses.length - 1].correct
      ),
    [guesses]
  );
  const hasReachedLimit = Boolean(
    guesses && guesses.guesses.length === DAILY_CHALLENGE_GUESS_LIMIT
  );

  const isNewDay = guesses?.date !== format(now, "yyyy-MM-dd");

  if (isNewDay) {
    setGuesses({
      date: format(now, "yyyy-MM-dd"),
      guesses: [],
    });
  }

  const onGuess = async ({ id }: PokemonNamesResponse) => {
    try {
      setIsLoading(true);
      const response = await api.daily.verifyGuess(id);
      setGuesses(() => {
        const guess = {
          ...response,
          pokemonId: id,
        };
        if (guesses) {
          return {
            ...guesses,
            guesses: guesses.guesses.concat(guess),
          };
        }
        return {
          date: formatDate(new Date(), "yyyy-MM-dd"),
          guesses: [guess],
        };
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isNewDay,
    guesses,
    onGuess,
    isLoading,
    hasSolved,
    hasReachedLimit,
  };
};
