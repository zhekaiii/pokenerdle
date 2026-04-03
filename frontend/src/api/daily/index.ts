import { FROZEN_DATE } from "@/pages/DailyChallenge/constants";
import {
  type DailyChallengeCalendarResponse,
  type DailyChallengeGuessResponse,
  type DailyChallengeStatsResponse,
  type DailyChallengeSyncGuessesResponse,
} from "@pokenerdle/shared/daily";
import { AxiosInstance } from "axios";

export default (axiosInstance: AxiosInstance) => ({
  submitGuess: async (id: number, date?: string) => {
    const { data } = await axiosInstance.post<DailyChallengeGuessResponse>(
      "/v1/daily/challenge/submit",
      {
        pokemon_id: id,
        date: date ?? FROZEN_DATE,
      }
    );
    return data;
  },
  getUserGuesses: async (date?: string) => {
    const { data } = await axiosInstance.get<DailyChallengeGuessResponse[]>(
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
      const { data } =
        await axiosInstance.post<DailyChallengeSyncGuessesResponse>(
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
  getAnswer: async (date?: string) => {
    const { data } = await axiosInstance.get<{
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
        date: date ?? FROZEN_DATE,
      },
    });
    return data;
  },
  getStats: async () => {
    const { data } = await axiosInstance.get<DailyChallengeStatsResponse>(
      "/v1/daily/challenge/stats"
    );
    return data;
  },
  getCalendar: async (month: string) => {
    const { data } = await axiosInstance.get<DailyChallengeCalendarResponse>(
      "/v1/daily/challenge/calendar",
      {
        params: { month },
      }
    );
    return data;
  },
});
