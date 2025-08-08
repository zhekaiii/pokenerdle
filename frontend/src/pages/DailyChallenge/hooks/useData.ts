import { useLocalStorage } from "react-use";

import { DAILY_CHALLENGE_KEY } from "../constants";

import { format } from "date-fns";

export type DailyChallenge = {
  date: string;
  guesses: number[];
};

export const useDailyChallengeData = () => {
  const [guesses, setGuesses] = useLocalStorage<DailyChallenge | null>(
    DAILY_CHALLENGE_KEY,
    null
  );

  const isNewDay = guesses?.date !== format(new Date(), "yyyy-MM-dd");

  return {
    isNewDay,
    guesses,
    setGuesses,
  };
};
