import api from "@/api";
import {
  SLIDER_DEFAULT,
  StatGuessFilter,
  StatGuessRoundResponse,
  StatGuessStats,
} from "@pokenerdle/shared";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { computeScore, StatGuessScore } from "../scoring";

export type StatGuessState =
  | { phase: "loading"; pokemonId?: number }
  | {
      phase: "guessing";
      round: StatGuessRoundResponse;
      guesses: StatGuessStats;
    }
  | {
      phase: "result";
      round: StatGuessRoundResponse;
      guesses: StatGuessStats;
      score: StatGuessScore;
    };

const initialGuesses = (): StatGuessStats => ({
  hp: SLIDER_DEFAULT,
  attack: SLIDER_DEFAULT,
  defense: SLIDER_DEFAULT,
  specialAttack: SLIDER_DEFAULT,
  specialDefense: SLIDER_DEFAULT,
  speed: SLIDER_DEFAULT,
});

export const useStatGuess = (filter: StatGuessFilter) => {
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<"guessing" | "result">("guessing");
  const [guesses, setGuesses] = useState<StatGuessStats>(initialGuesses);
  const [score, setScore] = useState<StatGuessScore | null>(null);

  const { data: round } = useQuery<StatGuessRoundResponse>({
    queryKey: ["statGuess", "round", filter, roundIndex],
    queryFn: () => api.statGuess.getRound(filter, []),
    staleTime: 0,
  });

  // Reset to "guessing" when a new round arrives.
  useEffect(() => {
    if (round) {
      setPhase("guessing");
      setGuesses(initialGuesses());
      setScore(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to pokemon id changing
  }, [round?.pokemonId]);

  // Reset roundIndex when filter changes.
  useEffect(() => {
    setRoundIndex(0);
  }, [filter]);

  const setGuess = (stat: keyof StatGuessStats, value: number) => {
    setGuesses((g) => ({ ...g, [stat]: value }));
  };

  const submit = () => {
    if (!round) return;
    setScore(computeScore(guesses, round.stats));
    setPhase("result");
  };

  const next = () => {
    setRoundIndex((i) => i + 1);
  };

  const state: StatGuessState = !round
    ? { phase: "loading" }
    : phase === "guessing"
      ? { phase: "guessing", round, guesses }
      : { phase: "result", round, guesses, score: score! };

  return { state, setGuess, submit, next };
};
