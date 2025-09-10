import api from "@/api";
import {
  DAILY_CHALLENGE_GUESS_LIMIT,
  DAILY_CHALLENGE_KEY,
  FROZEN_DATE,
} from "../constants";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { CheckCircle } from "lucide-react";
import posthog from "posthog-js";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export interface DailyChallenge {
  date: string;
  guesses: DailyChallengeGuessResponse[];
  synced?: boolean;
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

export const guessesAtom = atomWithStorage<DailyChallenge | null>(
  DAILY_CHALLENGE_KEY,
  null,
  undefined,
  {
    getOnInit: true,
  }
);

export const useDailyChallengeData = () => {
  const { isAuthenticated } = useAuth();
  const [guesses, setGuesses] = useAtom(guessesAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<CorrectAnswer | null>(
    null
  );
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const { t } = useTranslation("daily");

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
  const isNewDay = guesses?.date !== FROZEN_DATE;

  useEffect(() => {
    if (isNewDay) {
      setGuesses({
        date: FROZEN_DATE,
        guesses: [],
      });
      setCorrectAnswer(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only want to run on new day
  }, [isNewDay]);

  // Fetch correct answer when game is over and user hasn't solved it
  useEffect(() => {
    const fetchCorrectAnswer = async () => {
      if (hasReachedLimit && !hasSolved && !correctAnswer && !isLoadingAnswer) {
        try {
          setIsLoadingAnswer(true);
          const answer = await api.daily.getAnswer();
          setCorrectAnswer(answer);
        } catch (error) {
          console.error("Failed to fetch correct answer:", error);
        } finally {
          setIsLoadingAnswer(false);
        }
      }
    };

    fetchCorrectAnswer();
  }, [hasReachedLimit, hasSolved, correctAnswer, isLoadingAnswer]);

  const onGuess = async ({ id }: PokemonNamesResponse) => {
    const numGuesses = (guesses?.guesses.length ?? 0) + 1;
    try {
      setIsLoading(true);
      const response = await api.daily.submitGuess(id);
      setGuesses(() => {
        const guess = {
          ...response,
          pokemonId: id,
          synced: isAuthenticated,
        };
        if (guesses) {
          return {
            ...guesses,
            guesses: guesses.guesses.concat(guess),
          };
        }
        return {
          date: FROZEN_DATE,
          guesses: [guess],
        };
      });
      if (response.correct) {
        toast({
          variant: "positive",
          description: (
            <div className="tw:flex tw:flex-nowrap">
              <CheckCircle className="tw:mr-2" />
              <div>{t("toast.correctGuess")}</div>
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
              <div>{t("toast.gameOver")}</div>
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
    correctAnswer,
    isLoadingAnswer,
  };
};
