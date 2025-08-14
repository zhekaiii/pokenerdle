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

type CorrectAnswer = {
  pokemonId: number;
  pokemon: {
    type1: string;
    type2: string | null;
    height: number | null;
    generationId: number;
    color: string;
  };
};

const now = new Date();
const DAILY_CHALLENGE_DIALOG_KEY = "daily_challenge_dialog_shown";

export const useDailyChallengeData = () => {
  const [guesses, setGuesses] = useLocalStorage<DailyChallenge | null>(
    DAILY_CHALLENGE_KEY,
    null
  );
  const [dialogShown, setDialogShown] = useLocalStorage<string | null>(
    DAILY_CHALLENGE_DIALOG_KEY,
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<CorrectAnswer | null>(
    null
  );
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);

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
  const hasDialogBeenShownToday = dialogShown === format(now, "yyyy-MM-dd");

  useEffect(() => {
    if (isNewDay) {
      setGuesses({
        date: format(now, "yyyy-MM-dd"),
        guesses: [],
      });
      setCorrectAnswer(null);
      setDialogShown(null);
    }
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

  const markDialogAsShown = () => {
    setDialogShown(format(now, "yyyy-MM-dd"));
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
    hasDialogBeenShownToday,
    markDialogAsShown,
  };
};
