import { TZDate } from "@date-fns/tz";
import { SINGAPORE_TIMEZONE } from "@pokenerdle/shared/date";
import {
  WRAPPED_MIN_DAYS,
  WRAPPED_WINDOW_END,
  WRAPPED_WINDOW_START,
  type WrappedStats,
} from "@pokenerdle/shared/wrapped";
import { format } from "date-fns";

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

  // Placeholders below are filled in by the later stats tasks.
  const stats: WrappedStats = {
    daysPlayed,
    daysSolved,
    uniquePokemon,
    mostGuessed: [],
    streak: null,
    opener: { pokemonId: live[0].first.pokemonId, days: 1 },
    topTypes: [],
    clock: null,
    average: null,
    finish: "standard",
  };
  return { daysPlayed, eligible, stats };
};
