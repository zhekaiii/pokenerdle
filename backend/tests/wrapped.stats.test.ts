import { describe, expect, test } from "bun:test";
import { computeWrappedStats, type WrappedGuessRow } from "../src/services/wrapped.stats.js";

// A guess on `day`, made at `time` Singapore time on that same day unless `on` names another date.
const g = (day: string, guessNumber: number, o: { p?: number; ok?: boolean; time?: string; on?: string } = {}): WrappedGuessRow => ({
  dailyChallengeId: day, guessNumber, pokemonId: o.p ?? 1, isCorrect: o.ok ?? false,
  createdAt: new Date(`${o.on ?? day}T${o.time ?? "12:00:00"}+08:00`),
});
const days = (n: number, start = 1) => Array.from({ length: n }, (_, i) => `2026-03-${String(start + i).padStart(2, "0")}`);
const noTypes = () => [];
const solvedOn = (ds: string[]) => ds.map((d) => g(d, 1, { ok: true }));
const playedOn = (ds: string[]) => ds.map((d) => g(d, 1));
// One guess per entry of `ids`, spread round-robin over `dayList`, numbered from 1 within each day.
const guessesFrom = (ids: number[], dayList: string[]): WrappedGuessRow[] => {
  const count = new Map<string, number>();
  return ids.map((p, i) => {
    const day = dayList[i % dayList.length];
    const guessNumber = (count.get(day) ?? 0) + 1;
    count.set(day, guessNumber);
    return g(day, guessNumber, { p });
  });
};

describe("computeWrappedStats", () => {
  test("a day is live when the first guess is on the challenge date in Singapore", () => {
    expect(computeWrappedStats([g("2026-03-01", 1, { time: "23:59:59" })], noTypes).daysPlayed).toBe(1);
    expect(computeWrappedStats([g("2026-03-01", 1, { on: "2026-03-02", time: "00:00:00" })], noTypes).daysPlayed).toBe(0);
  });

  test("a day counts in full when only later guesses cross midnight", () => {
    const rows = [
      g("2026-03-01", 1, { time: "23:59:00" }),
      g("2026-03-01", 2, { on: "2026-03-02", time: "00:01:00", ok: true }),
      ...days(9, 2).flatMap((d) => [g(d, 1)]),
    ];
    const r = computeWrappedStats(rows, noTypes);
    expect(r.daysPlayed).toBe(10);
    expect(r.stats?.daysSolved).toBe(1);
  });

  test("an archive play is ignored entirely", () => {
    const rows = [
      g("2026-03-01", 1, { on: "2026-03-08", ok: true, p: 7 }),
      ...days(5, 2).map((d) => g(d, 1)),
    ];
    const r = computeWrappedStats(rows, noTypes);
    expect(r.daysPlayed).toBe(5);
    expect(r.stats?.uniquePokemon).toBe(1);
    expect(r.stats?.daysSolved).toBe(0);
  });

  test("days outside the window are ignored", () => {
    expect(computeWrappedStats([g("2025-12-31", 1)], noTypes)).toEqual({ daysPlayed: 0, eligible: false, stats: null });
    expect(computeWrappedStats([g("2026-12-01", 1)], noTypes)).toEqual({ daysPlayed: 0, eligible: false, stats: null });
    expect(computeWrappedStats([g("2026-03-06", 1)], noTypes, "2026-03-05")).toEqual({ daysPlayed: 0, eligible: false, stats: null });
  });

  test("4 live days is not eligible, 5 is", () => {
    const four = computeWrappedStats(days(4).map((d) => g(d, 1)), noTypes);
    expect(four.eligible).toBe(false);
    expect(four.stats).toBeNull();
    expect(four.daysPlayed).toBe(4);

    const five = computeWrappedStats(days(5).map((d) => g(d, 1)), noTypes);
    expect(five.eligible).toBe(true);
    expect(five.stats).not.toBeNull();
  });

  test("no rows", () => {
    expect(computeWrappedStats([], noTypes)).toEqual({ daysPlayed: 0, eligible: false, stats: null });
  });

  test("uniquePokemon counts distinct ids across all guesses on live days", () => {
    const rows = [
      ...days(10).map((d) => g(d, 1)),
      g("2026-03-01", 2, { p: 1 }),
      g("2026-03-02", 1, { p: 2 }),
      g("2026-03-03", 1, { p: 3 }),
      g("2026-03-04", 1, { p: 1 }),
    ];
    expect(computeWrappedStats(rows, noTypes).stats?.uniquePokemon).toBe(3);
  });

  test("daysSolved counts live days with a correct guess", () => {
    const rows = [
      ...days(10).map((d) => g(d, 1)),
      g("2026-03-02", 2, { ok: true }),
      g("2026-03-05", 3, { ok: true }),
      g("2026-03-05", 4, { ok: true }),
    ];
    expect(computeWrappedStats(rows, noTypes).stats?.daysSolved).toBe(2);
  });

  test("longest streak is the longest run of consecutive solved live dates", () => {
    const rows = [...solvedOn(days(5)), ...solvedOn(days(7, 7))];
    expect(computeWrappedStats(rows, noTypes).stats?.streak).toEqual({ length: 7, start: "2026-03-07", end: "2026-03-13" });
  });

  test("an unsolved day breaks the streak", () => {
    const rows = [...solvedOn(days(4)), ...playedOn(["2026-03-05"]), ...solvedOn(days(6, 6))];
    expect(computeWrappedStats(rows, noTypes).stats?.streak).toEqual({ length: 6, start: "2026-03-06", end: "2026-03-11" });
  });

  test("a streak crosses a month boundary", () => {
    const rows = [...solvedOn(["2026-03-30", "2026-03-31", "2026-04-01"]), ...playedOn(days(2))];
    expect(computeWrappedStats(rows, noTypes).stats?.streak).toEqual({ length: 3, start: "2026-03-30", end: "2026-04-01" });
  });

  test("a streak under 3 is null", () => {
    const rows = days(10).map((d, i) => g(d, 1, { ok: i % 2 === 0 }));
    const r = computeWrappedStats(rows, noTypes);
    expect(r.eligible).toBe(true);
    expect(r.stats?.streak).toBeNull();
  });

  test("equal streaks keep the earliest", () => {
    const rows = [...solvedOn(days(3)), ...playedOn(days(1, 4)), ...solvedOn(days(3, 5)), ...playedOn(days(3, 8))];
    expect(computeWrappedStats(rows, noTypes).stats?.streak).toEqual({ length: 3, start: "2026-03-01", end: "2026-03-03" });
  });

  test("opener is the most frequent first guess", () => {
    const rows = days(10).map((d, i) => g(d, 1, { p: i < 6 ? 445 : 6 }));
    expect(computeWrappedStats(rows, noTypes).stats?.opener).toEqual({ pokemonId: 445, days: 6 });
  });

  test("opener ties go to the one used most recently", () => {
    const rows = days(10).map((d, i) => g(d, 1, { p: i < 5 ? 445 : 6 }));
    expect(computeWrappedStats(rows, noTypes).stats?.opener).toEqual({ pokemonId: 6, days: 5 });
  });

  test("each guess counts once for each of its types", () => {
    const rows = days(10).map((d, i) => g(d, 1, { p: i < 6 ? 445 : 130 }));
    const typesOf = (id: number) => (id === 445 ? ["dragon", "ground"] : id === 130 ? ["water"] : []);
    expect(computeWrappedStats(rows, typesOf).stats?.topTypes).toEqual([
      { type: "dragon", share: 0.6 },
      { type: "ground", share: 0.6 },
      { type: "water", share: 0.4 },
    ]);
  });

  test("topTypes has at most 3 entries and skips Pokémon with no types", () => {
    const typeOf: Record<number, string[]> = { 1: [], 2: ["fire"], 3: ["water"], 4: ["grass"], 5: ["electric"] };
    const rows = guessesFrom([1, 1, 1, 1, 2, 2, 2, 3, 3, 4, 5], days(10));
    // Shares divide by all 11 guesses, including the 4 made on the typeless Pokémon 1.
    expect(computeWrappedStats(rows, (id) => typeOf[id]).stats?.topTypes).toEqual([
      { type: "fire", share: 3 / 11 },
      { type: "water", share: 2 / 11 },
      { type: "electric", share: 1 / 11 },
    ]);
  });

  test("mostGuessed lists up to 6 ids by guess count on live days", () => {
    const ids = [101, 101, 101, 101, 101, 102, 102, 102, 102, 103, 103, 103, 103, 104, 104, 104, 105, 105, 106, 106, 107, 108];
    expect(computeWrappedStats(guessesFrom(ids, days(10)), noTypes).stats?.mostGuessed).toEqual([101, 102, 103, 104, 105, 106]);
  });

  test("mostGuessed with 2 distinct ids gives 2", () => {
    expect(computeWrappedStats(guessesFrom([9, 9, 9, 3, 3, 3, 3], days(5)), noTypes).stats?.mostGuessed).toEqual([3, 9]);
  });
});
