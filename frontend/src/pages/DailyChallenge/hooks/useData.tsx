import api from "@/api";
import {
  DAILY_CALENDAR_QUERY_KEY,
  DAILY_CHALLENGE_GUESS_LIMIT,
} from "../constants";

import { PokemonNamesResponse } from "@pokenerdle/shared";
import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import { useQueryClient } from "@tanstack/react-query";
import { useRouteContext, useRouter } from "@tanstack/react-router";
import axios, { HttpStatusCode } from "axios";
import { atom, useAtom } from "jotai";
import posthog from "posthog-js";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export interface DailyChallenge {
  date: string;
  guesses: DailyChallengeGuessResponse[];
}

export interface DailyChallengeGuessSubmitResult {
  isFirstDailyChallengeGuess: boolean;
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
export const correctAnswerAtom = atom<CorrectAnswer | null>(null);

export const useDailyChallengeData = (date: string) => {
  const { today } = useRouteContext({ from: "/daily/" });
  const [guesses, setGuesses] = useAtom(guessesAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useAtom<CorrectAnswer | null>(
    correctAnswerAtom,
  );
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const { t } = useTranslation("daily");
  const queryClient = useQueryClient();
  const router = useRouter();

  const isArchive = useMemo(() => date !== today, [date, today]);

  const hasSolved = useMemo(
    () =>
      Boolean(
        guesses &&
        guesses.guesses.length &&
        guesses.guesses[guesses.guesses.length - 1].correct,
      ),
    [guesses],
  );
  const hasReachedLimit = Boolean(
    guesses && guesses.guesses.length === DAILY_CHALLENGE_GUESS_LIMIT,
  );
  const isGameFinished = hasReachedLimit || hasSolved;

  // Fetch correct answer when game is over and user hasn't solved it
  useEffect(() => {
    if (hasSolved) {
      setCorrectAnswer(guesses!.guesses.find((guess) => guess.correct)!);
      return;
    }

    if (!hasReachedLimit) return;

    const fetchCorrectAnswer = async () => {
      if (!correctAnswer && !isLoadingAnswer) {
        try {
          setIsLoadingAnswer(true);
          const answer = await api.daily.getAnswer(date);
          setCorrectAnswer(answer);
        } catch (error) {
          console.error("Failed to fetch correct answer:", error);
        } finally {
          setIsLoadingAnswer(false);
        }
      }
    };

    fetchCorrectAnswer();
  }, [hasReachedLimit, hasSolved, isLoadingAnswer, date, setCorrectAnswer]);

  const onGuess = async ({
    id,
  }: PokemonNamesResponse): Promise<DailyChallengeGuessSubmitResult> => {
    const numGuesses = (guesses?.guesses.length ?? 0) + 1;
    try {
      setIsLoading(true);
      const response = await api.daily.submitGuess(id, date);
      setGuesses(() => {
        const guess = {
          ...response.guess,
          pokemonId: id,
        };
        if (guesses) {
          return {
            ...guesses,
            guesses: guesses.guesses.concat(guess),
          };
        }
        return {
          date,
          guesses: [guess],
        };
      });
      void queryClient.invalidateQueries({
        queryKey: [DAILY_CALENDAR_QUERY_KEY],
      });
      if (response.guess.correct) {
        toast.success(`${t("toast.correctGuess")}`);
        posthog.capture("daily_challenge_solved", {
          num_guesses: numGuesses,
          isArchive,
        });
      } else if (numGuesses === DAILY_CHALLENGE_GUESS_LIMIT) {
        toast.error(t("toast.gameOver"));
        posthog.capture("daily_challenge_gameover", { isArchive });
      }
      return {
        isFirstDailyChallengeGuess: response.isFirstDailyChallengeGuess,
      };
    } catch (e) {
      if (
        axios.isAxiosError(e) &&
        e.response?.status === HttpStatusCode.Conflict
      ) {
        router.invalidate();
      }
    } finally {
      setIsLoading(false);
    }
    return {
      isFirstDailyChallengeGuess: false,
    };
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
  };
};
