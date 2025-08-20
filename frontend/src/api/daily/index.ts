import { type DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import axios from "axios";
import { formatDate } from "date-fns";

export default {
  verifyGuess: async (id: number) => {
    const { data } = await axios.post<DailyChallengeGuessResponse>(
      "/v1/daily/challenge/guess",
      {
        pokemon_id: id,
        date: formatDate(new Date(), "yyyy-MM-dd"),
      }
    );
    return data;
  },
  submitGuess: async (id: number, userId: string) => {
    const { data } = await axios.post<DailyChallengeGuessResponse>(
      "/v1/daily/challenge/submit",
      {
        pokemon_id: id,
        date: formatDate(new Date(), "yyyy-MM-dd"),
        user_id: userId,
      }
    );
    return data;
  },
  getUserGuesses: async (userId: string, date?: string) => {
    const { data } = await axios.get<DailyChallengeGuessResponse[]>(
      "/v1/daily/challenge/guesses",
      {
        params: {
          user_id: userId,
          date: date || formatDate(new Date(), "yyyy-MM-dd"),
        },
      }
    );
    return data;
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
        date: formatDate(new Date(), "yyyy-MM-dd"),
      },
    });
    return data;
  },
};
