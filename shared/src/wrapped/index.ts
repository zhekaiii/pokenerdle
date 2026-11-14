export const WRAPPED_YEAR = 2026;
export const WRAPPED_WINDOW_START = "2026-01-01";
export const WRAPPED_WINDOW_END = "2026-11-30";
export const WRAPPED_WINDOW_DAYS = 334;
export const WRAPPED_LAUNCH_DATE = "2026-12-01"; // first Singapore date it is live
export const WRAPPED_CLOSE_DATE = "2027-01-01";  // first Singapore date it is closed
export const WRAPPED_MIN_DAYS = 5;
export const WRAPPED_MIN_STREAK = 3;
export const WRAPPED_RARE_MIN_DAYS = 30;
export const WRAPPED_FOIL_MAX_AVG = 4.5;
export const WRAPPED_GOLD_MAX_AVG = 4.0;
export const WRAPPED_RAINBOW_MAX_AVG = 3.5;
export const WRAPPED_MAX_BATTLE_MS = 60 * 60 * 1000;

export type WrappedPhase = "before" | "live" | "closed";
export type WrappedFinish = "standard" | "foil" | "gold" | "rainbow";
export type WrappedLang = "en" | "zh-Hans" | "zh-Hant";

export interface WrappedSolve { ms: number; date: string; pokemonId: number } // date: yyyy-MM-dd, pokemonId: that day's answer
export interface WrappedStats {
  daysPlayed: number;
  daysSolved: number;
  uniquePokemon: number;
  mostGuessed: number[]; // up to 6 pokemonIds, most guessed first, for the thumbnails on screen 2
  streak: { length: number; start: string; end: string } | null; // null when under WRAPPED_MIN_STREAK
  opener: { pokemonId: number; days: number };
  topTypes: { type: string; share: number }[]; // up to 3, lowercase English type id, share 0..1
  clock: { fastest: WrappedSolve; longest: WrappedSolve | null } | null;
  average: number | null; // already rounded to one decimal
  finish: WrappedFinish;
}
export interface WrappedPokemonInfo { names: Record<WrappedLang, string>; artwork: string | null }
export interface WrappedResponse {
  phase: WrappedPhase;
  eligible: boolean;
  daysPlayed: number;
  stats: WrappedStats | null;               // null unless phase is "live" and eligible
  simple: { pokemonId: number; date: string } | null; // first-ever guess (Singapore date); set only when live, not eligible, and the player has guessed before
  pokemon: Record<number, WrappedPokemonInfo & { types: string[] }>; // every pokemonId referenced in stats or simple
}

// todaySgt: Singapore date as yyyy-MM-dd. Dates compare as strings.
export const getWrappedPhase = (todaySgt: string): WrappedPhase => {
  if (todaySgt < WRAPPED_LAUNCH_DATE) return "before";
  if (todaySgt >= WRAPPED_CLOSE_DATE) return "closed";
  return "live";
};

export const roundAverage = (mean: number): number => Math.round(mean * 10) / 10;

// average: already rounded to one decimal (see roundAverage). null when there is no average.
export const getWrappedFinish = (
  average: number | null,
  daysPlayed: number,
): WrappedFinish => {
  if (average === null || average > WRAPPED_FOIL_MAX_AVG) return "standard";
  if (average > WRAPPED_GOLD_MAX_AVG) return "foil";
  if (daysPlayed < WRAPPED_RARE_MIN_DAYS) return "foil";
  if (average > WRAPPED_RAINBOW_MAX_AVG) return "gold";
  return "rainbow";
};
