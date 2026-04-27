import * as z from "zod";

export const DailyChallengeGuessRequestSchema = z.object({
  pokemon_id: z.int(),
  date: z.iso.date(),
});

export const DailyChallengeSubmitGuessRequestSchema = z.object({
  pokemon_id: z.int(),
  date: z.iso.date(),
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

export interface DailyChallengeSubmitGuessResponse {
  guess: DailyChallengeGuessResponse;
  isFirstDailyChallengeGuess: boolean;
}

export type DailyChallengeStatsResponse = {
  num_played: number;
  win_rate: number;
  streak: number;
  max_streak: number;
  histogram: Record<number, number>;
};

export const DailyChallengeCalendarRequestSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
});

export type DailyChallengeCalendarRequest = z.infer<
  typeof DailyChallengeCalendarRequestSchema
>;

export type DailyChallengeCalendarEntry = {
  date: string;
  solved: boolean;
  pokemonId: number;
  attempts: number;
};

export type DailyChallengeCalendarResponse = {
  entries: DailyChallengeCalendarEntry[];
};
