import * as z from "zod";

export const DailyChallengeGuessRequestSchema = z.object({
  pokemon_id: z.int(),
  date: z.iso.date(),
});

export const DailyChallengeSubmitGuessRequestSchema = z.object({
  pokemon_id: z.int(),
  date: z.iso.date(),
});

export const DailyChallengeSyncGuessesRequestSchema = z.object({
  guesses: z.array(
    z.object({
      pokemonId: z.number(),
    })
  ),
  date: z.iso.date(),
});

export type DailyChallengeGuessRequest = z.infer<
  typeof DailyChallengeGuessRequestSchema
>;

export type DailyChallengeSubmitGuessRequest = z.infer<
  typeof DailyChallengeSubmitGuessRequestSchema
>;

export type DailyChallengeSyncGuessesRequest = z.infer<
  typeof DailyChallengeSyncGuessesRequestSchema
>;

export type DailyChallengeSyncGuessesResponse = {
  syncedGuesses: DailyChallengeGuessResponse[];
  existingGuesses: DailyChallengeGuessResponse[];
  message: string;
};

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
