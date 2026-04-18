import api from "@/api";
import { DAILY_CHALLENGE_GUESS_LIMIT, FROZEN_DATE } from "../constants";

import { PokemonNamesResponse } from "@pokenerdle/shared";
import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import { atom, useAtom } from "jotai";
import posthog from "posthog-js";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export interface DailyChallenge {
  date: string;
  guesses: DailyChallengeGuessResponse[];
}

export interface CorrectAnswer {
  pokemonId: number;
  pokemon: {
    type1: string;
    type2: string | null;
    height: number | null;
    generationId: number;
    color: string;
  };
}

export const guessesAtom = atom<DailyChallenge | null>(null);

export const useDailyChallengeData = (date?: string) => {
  const [guesses, setGuesses] = useAtom(guessesAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<CorrectAnswer | null>(
    null
  );
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const { t } = useTranslation("daily");

  const activeDate = date ?? FROZEN_DATE;
  const isArchive = activeDate !== FROZEN_DATE;

  // Reset the revealed answer when the active date changes so we don't leak
  // the previous day's Pokémon into a different archive challenge.
  useEffect(() => {
    setCorrectAnswer(null);
    setIsLoadingAnswer(false);
  }, [activeDate]);

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
  const isGameFinished = hasReachedLimit || hasSolved;

  // Fetch correct answer when game is over and user hasn't solved it
  useEffect(() => {
    const fetchCorrectAnswer = async () => {
      if (hasReachedLimit && !hasSolved && !correctAnswer && !isLoadingAnswer) {
        try {
          setIsLoadingAnswer(true);
          const answer = await api.daily.getAnswer(activeDate);
          setCorrectAnswer(answer);
        } catch (error) {
          console.error("Failed to fetch correct answer:", error);
        } finally {
          setIsLoadingAnswer(false);
        }
      }
    };

    fetchCorrectAnswer();
  }, [hasReachedLimit, hasSolved, correctAnswer, isLoadingAnswer, activeDate]);

  const onGuess = async ({ id }: PokemonNamesResponse) => {
    const numGuesses = (guesses?.guesses.length ?? 0) + 1;
    try {
      setIsLoading(true);
      const response = await api.daily.submitGuess(id, activeDate);
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
          date: activeDate,
          guesses: [guess],
        };
      });
      if (response.correct) {
        toast.success(`${t("toast.correctGuess")}`);
        posthog.capture("daily_challenge_solved", {
          num_guesses: numGuesses,
          isArchive,
        });
      } else if (numGuesses === DAILY_CHALLENGE_GUESS_LIMIT) {
        toast.error(t("toast.gameOver"));
        posthog.capture("daily_challenge_gameover", { isArchive });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    guesses,
    onGuess,
    isLoading,
    hasSolved,
    hasReachedLimit,
    isGameFinished,
    correctAnswer,
    isLoadingAnswer,
    isArchive,
    activeDate,
  };
};
