export const WRAPPED_YEAR = 2026;
export const WRAPPED_WINDOW_START = "2026-01-01";
export const WRAPPED_WINDOW_END = "2026-11-30";

// Inclusive day count between two yyyy-MM-dd strings, read as UTC calendar dates.
const utcDayNumber = (day: string): number => {
  const [year, month, date] = day.split("-").map(Number);
  return Date.UTC(year, month - 1, date) / (24 * 60 * 60 * 1000);
};
export const WRAPPED_WINDOW_DAYS =
  utcDayNumber(WRAPPED_WINDOW_END) - utcDayNumber(WRAPPED_WINDOW_START) + 1;

export const WRAPPED_LAUNCH_DATE = "2026-12-01"; // first Singapore date it is live
export const WRAPPED_CLOSE_DATE = "2027-01-01"; // first Singapore date it is closed
export const WRAPPED_MIN_DAYS = 5;
export const WRAPPED_MIN_STREAK = 3;
export const WRAPPED_FINISH_MIN_SOLVED = 10;
export const WRAPPED_FOIL_MAX_AVG = 5.5;
export const WRAPPED_GOLD_MAX_AVG = 4.5;
export const WRAPPED_RAINBOW_MAX_AVG = 4.0;
export const WRAPPED_MAX_BATTLE_MS = 60 * 60 * 1000;

export type WrappedPhase = "before" | "live" | "closed";
export type WrappedFinish = "standard" | "foil" | "gold" | "rainbow";
export type WrappedLang = "en" | "zh-Hans" | "zh-Hant";

// date: yyyy-MM-dd, pokemonId: that day's answer
export interface WrappedSolve {
  ms: number;
  date: string;
  pokemonId: number;
}

export interface WrappedStats {
  daysPlayed: number;
  daysSolved: number;
  uniquePokemon: number;
  // up to 6 pokemonIds, most guessed first, for the thumbnails on screen 2
  mostGuessed: number[];
  // null when under WRAPPED_MIN_STREAK
  streak: { length: number; start: string; end: string } | null;
  opener: { pokemonId: number; days: number };
  // up to 3, lowercase English type id, share 0..1
  topTypes: { type: string; share: number }[];
  clock: { fastest: WrappedSolve; longest: WrappedSolve | null } | null;
  // already rounded to one decimal
  average: number | null;
  finish: WrappedFinish;
}

export interface WrappedPokemonInfo {
  names: Record<WrappedLang, string>;
  artwork: string | null;
}

export type WrappedPokemon = WrappedPokemonInfo & { types: string[] };

export interface WrappedResponse {
  phase: WrappedPhase;
  eligible: boolean;
  daysPlayed: number;
  // null unless phase is "live" and eligible
  stats: WrappedStats | null;
  // first-ever guess (Singapore date); set only when live, not eligible, and the player has guessed before
  simple: { pokemonId: number; date: string } | null;
  // every pokemonId referenced in stats or simple
  pokemon: Record<number, WrappedPokemon>;
}

// todaySgt: Singapore date as yyyy-MM-dd. Dates compare as strings.
export const getWrappedPhase = (todaySgt: string): WrappedPhase => {
  if (todaySgt < WRAPPED_LAUNCH_DATE) return "before";
  if (todaySgt >= WRAPPED_CLOSE_DATE) return "closed";
  return "live";
};

export const roundAverage = (mean: number): number => Math.round(mean * 10) / 10;

// mean: the exact mean guesses per solve, not rounded. null when there is no solved day.
// A finish needs the mean strictly under its threshold.
export const getWrappedFinish = (mean: number | null, daysSolved: number): WrappedFinish => {
  if (mean === null || daysSolved < WRAPPED_FINISH_MIN_SOLVED) return "standard";
  if (mean >= WRAPPED_FOIL_MAX_AVG) return "standard";
  if (mean >= WRAPPED_GOLD_MAX_AVG) return "foil";
  if (mean >= WRAPPED_RAINBOW_MAX_AVG) return "gold";
  return "rainbow";
};
