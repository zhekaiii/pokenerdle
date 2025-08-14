import { useLocalStorage } from "react-use";

import { DAILY_CHALLENGE_GUESS_LIMIT, DAILY_CHALLENGE_KEY } from "../constants";

import api from "@/api";
import { useToast } from "@/hooks/useToast";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import { format, formatDate } from "date-fns";
import { CheckCircle } from "lucide-react";
import posthog from "posthog-js";
import { useEffect, useMemo, useState } from "react";

export type DailyChallenge = {
  date: string;
  guesses: DailyChallengeGuessResponse[];
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
  const { toast } = useToast();
  const hasReachedLimit = Boolean(
    guesses && guesses.guesses.length === DAILY_CHALLENGE_GUESS_LIMIT
  );
  const isGameFinished = hasReachedLimit || hasSolved;
  const isNewDay = guesses?.date !== format(now, "yyyy-MM-dd");

  useEffect(() => {
    if (isNewDay) {
      setGuesses({
        date: format(now, "yyyy-MM-dd"),
        guesses: [],
      });
    }
  }, [isNewDay]);

  const onGuess = async ({ id }: PokemonNamesResponse) => {
    const numGuesses = (guesses?.guesses.length ?? 0) + 1;
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
      if (response.correct) {
        toast({
          variant: "positive",
          description: (
            <div className="tw:flex tw:flex-nowrap">
              <CheckCircle className="tw:mr-2" />
              <div>You got it! Well done!</div>
            </div>
          ),
        });
        posthog.capture("daily_challenge_solved", {
          num_guesses: numGuesses,
        });
      } else if (numGuesses === DAILY_CHALLENGE_GUESS_LIMIT) {
        toast({
          variant: "destructive",
          description: (
            <div className="tw:flex tw:flex-nowrap">
              <div>Game Over! Better luck tomorrow!</div>
            </div>
          ),
        });
        posthog.capture("daily_challenge_gameover");
      }
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
    isGameFinished,
  };
};
