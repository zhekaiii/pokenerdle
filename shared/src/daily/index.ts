import * as z from "zod";

export const DailyChallengeGuessRequestSchema = z.object({
  pokemon_id: z.int(),
  date: z.iso.date(),
});

export type DailyChallengeGuessRequest = z.infer<
  typeof DailyChallengeGuessRequestSchema
>;

export type DailyChallengeGuessResponse =
  | { correct: true }
  | {
      correct?: never;
      type1Correctness: "=" | number;
      type2Correctness: "=" | number;
      genCorrectness: "=" | "<" | ">";
      heightCorrectness: "=" | "<" | ">";
      colorCorrectness: boolean;
    };
