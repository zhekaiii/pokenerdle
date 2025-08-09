import * as z from "zod";

export const DailyChallengeGuessRequestSchema = z.object({
  pokemon_id: z.int(),
  date: z.iso.date(),
});

export type DailyChallengeGuessRequest = z.infer<
  typeof DailyChallengeGuessRequestSchema
>;

export type DailyChallengeGuessResponse = {
  pokemon: {
    type1: string;
    type2: string | null;
    height: number | null;
    generationId: number;
    color: string;
  };
} & (
  | {
      correct: true;
    }
  | {
      correct?: never;
      type1Correctness: "=" | number;
      type2Correctness: "=" | number;
      genCorrectness: "=" | "<" | ">";
      heightCorrectness: "=" | "<" | ">";
      colorCorrectness: boolean;
    }
);
