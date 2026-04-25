import api from "@/api";
import {
  SLIDER_DEFAULT,
  StatGuessFilter,
  StatGuessRoundResponse,
  StatGuessStats,
} from "@pokenerdle/shared";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { computeScore, StatGuessScore } from "../scoring";

export type StatGuessErrorKind = "noMatch" | "loadFailed";

export type StatGuessState =
  | { phase: "loading" }
  | { phase: "error"; kind: StatGuessErrorKind }
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

export const useStatGuesser = (filter: StatGuessFilter) => {
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<"guessing" | "result">("guessing");
  const [guesses, setGuesses] = useState<StatGuessStats>(initialGuesses);
  const [score, setScore] = useState<StatGuessScore | null>(null);
  const [session, setSession] = useState<{
    completed: number;
    sumPercent: number;
    bestPercent: number;
    bestPokemonId: number | null;
  }>({
    completed: 0,
    sumPercent: 0,
    bestPercent: 0,
    bestPokemonId: null,
  });

  const recentIdsRef = useRef<number[]>([]);

  const {
    data: round,
    error: roundError,
    refetch,
  } = useQuery<StatGuessRoundResponse>({
    queryKey: ["statGuesser", "round", filter, roundIndex],
    queryFn: () => api.statGuesser.getRound(filter, recentIdsRef.current),
    staleTime: 0,
    retry: false,
  });

  // Append the new Pokémon to the recent list, keeping the last 3.
  useEffect(() => {
    if (round) {
      recentIdsRef.current = [...recentIdsRef.current, round.pokemonId].slice(
        -3,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to pokemon id changing
  }, [round?.pokemonId]);

  // Clear the recent list when filter changes — exclude lists are
  // pool-specific, so a different scope shouldn't be constrained by IDs from
  // the previous scope.
  useEffect(() => {
    recentIdsRef.current = [];
  }, [filter]);

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
    const newScore = computeScore(guesses, round.stats);
    setScore(newScore);
    setPhase("result");
    setSession((s) => ({
      completed: s.completed + 1,
      sumPercent: s.sumPercent + newScore.overallPercent,
      bestPercent: Math.max(s.bestPercent, newScore.overallPercent),
      bestPokemonId:
        newScore.overallPercent > s.bestPercent
          ? round.pokemonId
          : s.bestPokemonId,
    }));
  };

  const next = () => {
    setRoundIndex((i) => i + 1);
  };

  const retry = () => {
    void refetch();
  };

  // Map an axios error to a UI error kind. A 404 with the documented
  // `no_pokemon_match_filter` body means the filter pool is empty; everything
  // else is a generic load failure.
  const errorKind = (err: unknown): StatGuessErrorKind => {
    if (
      err &&
      typeof err === "object" &&
      "response" in err &&
      err.response &&
      typeof err.response === "object" &&
      "data" in err.response &&
      err.response.data &&
      typeof err.response.data === "object" &&
      "error" in err.response.data &&
      err.response.data.error === "no_pokemon_match_filter"
    ) {
      return "noMatch";
    }
    return "loadFailed";
  };

  const state: StatGuessState = round
    ? phase === "guessing"
      ? { phase: "guessing", round, guesses }
      : { phase: "result", round, guesses, score: score! }
    : roundError
      ? { phase: "error", kind: errorKind(roundError) }
      : { phase: "loading" };

  return { state, setGuess, submit, next, retry, session };
};
