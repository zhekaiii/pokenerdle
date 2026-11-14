import { TZDate } from "@date-fns/tz";
import { SINGAPORE_TIMEZONE } from "@pokenerdle/shared/date";
import {
  getWrappedFinish,
  roundAverage,
  WRAPPED_MAX_BATTLE_MS,
  WRAPPED_MIN_DAYS,
  WRAPPED_MIN_STREAK,
  WRAPPED_WINDOW_END,
  WRAPPED_WINDOW_START,
  type WrappedSolve,
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

interface SolvedDay {
  live: LiveDay;
  correct: WrappedGuessRow; // the lowest-numbered correct guess of the day
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

const findSolvedDays = (live: LiveDay[]): SolvedDay[] =>
  live.flatMap((day) => {
    const correct = day.guesses
      .filter((g) => g.isCorrect)
      .sort((a, b) => a.guessNumber - b.guessNumber)[0];
    return correct ? [{ live: day, correct }] : [];
  });

const toSolve = ({ live, correct }: SolvedDay): WrappedSolve => ({
  ms: correct.createdAt.getTime() - live.first.createdAt.getTime(),
  date: live.day,
  pokemonId: correct.pokemonId,
});

// Fastest and longest battles. Only solves after a first guess count, and only within the one-hour cap.
// Ties go to the earliest date. The longest battle is taken from the days other than the fastest.
const findClock = (solved: SolvedDay[]): WrappedStats["clock"] => {
  const battles = solved
    .filter(({ correct }) => correct.guessNumber >= 2)
    .map(toSolve)
    .filter((s) => s.ms <= WRAPPED_MAX_BATTLE_MS)
    .sort((a, b) => a.ms - b.ms || a.date.localeCompare(b.date));
  const fastest = battles[0];
  if (!fastest) return null;
  const longest = battles
    .slice(1)
    .sort((a, b) => b.ms - a.ms || a.date.localeCompare(b.date))[0];
  return { fastest, longest: longest ?? null };
};

// Mean guess count over solved live days, including one-guess solves. Rounded to one decimal.
const findAverage = (solved: SolvedDay[]): number | null => {
  if (solved.length === 0) return null;
  const total = solved.reduce((sum, { correct }) => sum + correct.guessNumber, 0);
  return roundAverage(total / solved.length);
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

  const solved = findSolvedDays(live);
  const daysSolved = solved.length;
  const uniquePokemon = new Set(live.flatMap((d) => d.guesses.map((g) => g.pokemonId))).size;
  const guessCounts = countGuesses(live);
  const totalGuesses = [...guessCounts.values()].reduce((sum, n) => sum + n, 0);
  const mostGuessed = [...guessCounts]
    .sort(([idA, a], [idB, b]) => b - a || idA - idB)
    .slice(0, 6)
    .map(([pokemonId]) => pokemonId);
  const average = findAverage(solved);

  const stats: WrappedStats = {
    daysPlayed,
    daysSolved,
    uniquePokemon,
    mostGuessed,
    streak: longestStreak(solved.map((s) => s.live.day)),
    opener: findOpener(live),
    topTypes: findTopTypes(guessCounts, totalGuesses, typesOf),
    clock: findClock(solved),
    average,
    finish: getWrappedFinish(average, daysPlayed),
  };
  return { daysPlayed, eligible, stats };
};
