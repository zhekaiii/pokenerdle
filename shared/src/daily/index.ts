import * as z from "zod";

export const DailyChallengeGuessRequestSchema = z.object({
  pokemon_id: z.int(),
  date: z.iso.date(),
});

export const DailyChallengeSubmitGuessRequestSchema = z.object({
  pokemon_id: z.int(),
  date: z.iso.date(),
  user_id: z.string(),
});

export type DailyChallengeGuessRequest = z.infer<
  typeof DailyChallengeGuessRequestSchema
>;

export type DailyChallengeSubmitGuessRequest = z.infer<
  typeof DailyChallengeSubmitGuessRequestSchema
>;

export type DailyChallengeGuessResponse = {
  pokemon: {
    type1: string;
    type2: string | null;
    height: number | null;
    generationId: number;
    color: string;
  };
  pokemonId: number;
} & (
  | {
      correct: true;
    }
  | {
      correct?: never;
      type1Correctness: "=" | number;
      type2Correctness: "=" | number | "NA";
      genCorrectness: "=" | "<" | ">";
      heightCorrectness: "=" | "<" | ">";
      colorCorrectness: boolean;
    }
);
