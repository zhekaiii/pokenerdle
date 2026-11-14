import { TZDate } from "@date-fns/tz";
import { SINGAPORE_TIMEZONE } from "@pokenerdle/shared/date";
import {
  WRAPPED_MIN_DAYS,
  WRAPPED_MIN_STREAK,
  WRAPPED_WINDOW_END,
  WRAPPED_WINDOW_START,
  type WrappedStats,
} from "@pokenerdle/shared/wrapped";
import { addDays, format } from "date-fns";

export interface WrappedGuessRow {
  dailyChallengeId: string; // yyyy-MM-dd
  pokemonId: number;
  guessNumber: number;
  isCorrect: boolean;
  createdAt: Date; // UTC instant
}

export interface WrappedComputed {
  daysPlayed: number;
  eligible: boolean;
  stats: WrappedStats | null;
}

interface LiveDay {
  day: string;
  first: WrappedGuessRow;
  guesses: WrappedGuessRow[];
}

const singaporeDate = (instant: Date): string =>
  format(new TZDate(instant, SINGAPORE_TIMEZONE), "yyyy-MM-dd");

// A day is live when its first guess was made on the challenge date in Singapore.
// Later guesses are counted in full even if they cross midnight.
const findLiveDays = (rows: WrappedGuessRow[], windowEnd: string): LiveDay[] => {
  const byDay = new Map<string, WrappedGuessRow[]>();
  for (const row of rows) {
    if (row.dailyChallengeId < WRAPPED_WINDOW_START || row.dailyChallengeId > windowEnd) continue;
    const guesses = byDay.get(row.dailyChallengeId);
    if (guesses) guesses.push(row);
    else byDay.set(row.dailyChallengeId, [row]);
  }

  const live: LiveDay[] = [];
  for (const [day, guesses] of byDay) {
    const first = guesses.find((g) => g.guessNumber === 1);
    if (first && singaporeDate(first.createdAt) === day) live.push({ day, first, guesses });
  }
  return live.sort((a, b) => a.day.localeCompare(b.day));
};

// Noon UTC keeps the calendar date stable whatever the server's time zone.
const nextDay = (day: string): string =>
  addDays(new Date(`${day}T12:00:00Z`), 1).toISOString().slice(0, 10);

// Longest run of consecutive solved dates. Equal runs keep the earliest, so only a strictly longer run replaces it.
const longestStreak = (solvedDays: string[]): WrappedStats["streak"] => {
  let best: NonNullable<WrappedStats["streak"]> | null = null;
  let run: NonNullable<WrappedStats["streak"]> | null = null;
  for (const day of solvedDays) {
    run = run && nextDay(run.end) === day
      ? { length: run.length + 1, start: run.start, end: day }
      : { length: 1, start: day, end: day };
    if (!best || run.length > best.length) best = run;
  }
  return best && best.length >= WRAPPED_MIN_STREAK ? best : null;
};

const countGuesses = (live: LiveDay[]): Map<number, number> => {
  const counts = new Map<number, number>();
  for (const { guesses } of live) {
    for (const { pokemonId } of guesses) counts.set(pokemonId, (counts.get(pokemonId) ?? 0) + 1);
  }
  return counts;
};

// Ties go to the id whose most recent opener is latest. Live days are sorted, so the last one seen is the latest.
const findOpener = (live: LiveDay[]): WrappedStats["opener"] => {
  const openings = new Map<number, { days: number; lastDay: string }>();
  for (const { day, first } of live) {
    const entry = openings.get(first.pokemonId) ?? { days: 0, lastDay: day };
    openings.set(first.pokemonId, { days: entry.days + 1, lastDay: day });
  }
  let best: { pokemonId: number; days: number; lastDay: string } | null = null;
  for (const [pokemonId, { days, lastDay }] of openings) {
    if (!best || days > best.days || (days === best.days && lastDay > best.lastDay)) {
      best = { pokemonId, days, lastDay };
    }
  }
  return { pokemonId: best!.pokemonId, days: best!.days };
};

// Share is guesses containing the type over all guesses on live days. Ties in share are ordered alphabetically.
const findTopTypes = (
  guessCounts: Map<number, number>,
  total: number,
  typesOf: (pokemonId: number) => string[],
): WrappedStats["topTypes"] => {
  const typeCounts = new Map<string, number>();
  for (const [pokemonId, count] of guessCounts) {
    for (const type of new Set(typesOf(pokemonId))) {
      typeCounts.set(type, (typeCounts.get(type) ?? 0) + count);
    }
  }
  return [...typeCounts]
    .sort(([typeA, a], [typeB, b]) => b - a || typeA.localeCompare(typeB))
    .slice(0, 3)
    .map(([type, count]) => ({ type, share: count / total }));
};

export const computeWrappedStats = (
  rows: WrappedGuessRow[],
  typesOf: (pokemonId: number) => string[],
  windowEnd: string = WRAPPED_WINDOW_END,
): WrappedComputed => {
  const live = findLiveDays(rows, windowEnd);
  const daysPlayed = live.length;
  const eligible = daysPlayed >= WRAPPED_MIN_DAYS;
  if (!eligible) return { daysPlayed, eligible, stats: null };

  const daysSolved = live.filter((d) => d.guesses.some((g) => g.isCorrect)).length;
  const uniquePokemon = new Set(live.flatMap((d) => d.guesses.map((g) => g.pokemonId))).size;
  const guessCounts = countGuesses(live);
  const totalGuesses = [...guessCounts.values()].reduce((sum, n) => sum + n, 0);
  const mostGuessed = [...guessCounts]
    .sort(([idA, a], [idB, b]) => b - a || idA - idB)
    .slice(0, 6)
    .map(([pokemonId]) => pokemonId);
  const solvedDays = live.filter((d) => d.guesses.some((g) => g.isCorrect)).map((d) => d.day);

  // clock, average and finish are filled in by later stats tasks.
  const stats: WrappedStats = {
    daysPlayed,
    daysSolved,
    uniquePokemon,
    mostGuessed,
    streak: longestStreak(solvedDays),
    opener: findOpener(live),
    topTypes: findTopTypes(guessCounts, totalGuesses, typesOf),
    clock: null,
    average: null,
    finish: "standard",
  };
  return { daysPlayed, eligible, stats };
};
