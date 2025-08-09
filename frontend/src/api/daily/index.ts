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
};
