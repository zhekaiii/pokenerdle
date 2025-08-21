import { FROZEN_DATE } from "@/pages/DailyChallenge/constants";
import {
  type DailyChallengeGuessResponse,
  type DailyChallengeStatsResponse,
  type DailyChallengeSyncGuessesResponse,
} from "@pokenerdle/shared/daily";
import axios from "axios";

export default {
  submitGuess: async (id: number) => {
    const { data } = await axios.post<DailyChallengeGuessResponse>(
      "/v1/daily/challenge/submit",
      {
        pokemon_id: id,
        date: FROZEN_DATE,
      }
    );
    return data;
  },
  getUserGuesses: async (date?: string) => {
    const { data } = await axios.get<DailyChallengeGuessResponse[]>(
      "/v1/daily/challenge/guesses",
      {
        params: {
          date: date || FROZEN_DATE,
        },
      }
    );
    return data;
  },
  syncGuesses: async (guesses: DailyChallengeGuessResponse[], date: string) => {
    try {
      const { data } = await axios.post<DailyChallengeSyncGuessesResponse>(
        "/v1/daily/challenge/sync",
        {
          guesses: guesses.map((guess) => ({ pokemonId: guess.pokemonId })),
          date,
        }
      );
      return data;
    } catch (error) {
      console.error("Failed to sync guesses:", error);
      throw error;
    }
  },
  getAnswer: async () => {
    const { data } = await axios.get<{
      pokemonId: number;
      pokemon: {
        type1: string;
        type2: string | null;
        height: number | null;
        generationId: number;
        color: string;
      };
    }>("/v1/daily/challenge/answer", {
      params: {
        date: FROZEN_DATE,
      },
    });
    return data;
  },
  getStats: async () => {
    const { data } = await axios.get<DailyChallengeStatsResponse>(
      "/v1/daily/challenge/stats"
    );
    return data;
  },
};
