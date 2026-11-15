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
// A day solved on guess `n`, with guesses 1 to n all made at 12:00:00.
const solvedIn = (day: string, n: number, p = 1) =>
  Array.from({ length: n }, (_, i) => g(day, i + 1, { p, ok: i + 1 === n }));
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
    // 445 opens Mar 6 to 10 and comes first in the rows; 6 opens Mar 1 to 5 and comes last.
    // Row order alone would pick 445 as first-seen and 6 as last-seen, so only the dates decide.
    const rows = [
      ...days(10).slice(5).map((d) => g(d, 1, { p: 445 })),
      ...days(5).map((d) => g(d, 1, { p: 6 })),
    ];
    expect(computeWrappedStats(rows, noTypes).stats?.opener).toEqual({ pokemonId: 445, days: 5 });
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

  test("fastest solve is the shortest gap between first and correct guess", () => {
    const rows = [
      g("2026-03-01", 1, { time: "12:00:00" }),
      g("2026-03-01", 3, { time: "12:00:38", ok: true, p: 25 }),
      ...playedOn(days(4, 2)),
    ];
    const clock = computeWrappedStats(rows, noTypes).stats?.clock;
    expect(clock?.fastest).toEqual({ ms: 38000, date: "2026-03-01", pokemonId: 25 });
    expect(clock?.longest).toBeNull();
  });

  test("a one-guess solve is never the fastest", () => {
    const rows = [
      g("2026-03-01", 1, { ok: true, p: 4 }),
      g("2026-03-02", 1, { time: "12:00:00" }),
      g("2026-03-02", 2, { time: "12:05:00", ok: true, p: 7 }),
      ...playedOn(days(3, 3)),
    ];
    expect(computeWrappedStats(rows, noTypes).stats?.clock?.fastest).toEqual({ ms: 300000, date: "2026-03-02", pokemonId: 7 });
  });

  test("longest battle ignores days over an hour", () => {
    const rows = [
      g("2026-03-01", 1, { time: "12:00:00" }),
      g("2026-03-01", 2, { time: "12:02:00", ok: true }),
      g("2026-03-02", 1, { time: "12:00:00" }),
      g("2026-03-02", 2, { time: "12:09:00", ok: true, p: 2 }),
      g("2026-03-03", 1, { time: "12:00:00" }),
      g("2026-03-03", 2, { time: "13:01:00", ok: true }),
      ...playedOn(days(2, 4)),
    ];
    expect(computeWrappedStats(rows, noTypes).stats?.clock?.longest).toEqual({ ms: 540000, date: "2026-03-02", pokemonId: 2 });
  });

  test("exactly an hour is allowed as the longest battle", () => {
    const rows = [
      g("2026-03-01", 1, { time: "12:00:00" }),
      g("2026-03-01", 2, { time: "12:02:00", ok: true }),
      g("2026-03-02", 1, { time: "12:00:00" }),
      g("2026-03-02", 2, { time: "13:00:00", ok: true, p: 2 }),
      ...playedOn(days(3, 3)),
    ];
    expect(computeWrappedStats(rows, noTypes).stats?.clock?.longest?.ms).toBe(3600000);
  });

  test("longest is null when the only qualifying day is the fastest day", () => {
    const rows = [
      g("2026-03-01", 1, { time: "12:00:00" }),
      g("2026-03-01", 2, { time: "12:05:00", ok: true }),
      g("2026-03-02", 1, { time: "12:00:00" }),
      g("2026-03-02", 2, { time: "13:01:00", ok: true }),
      ...playedOn(days(3, 3)),
    ];
    const clock = computeWrappedStats(rows, noTypes).stats?.clock;
    expect(clock?.fastest.ms).toBe(300000);
    expect(clock?.longest).toBeNull();
  });

  test("clock is null with no solved day of two or more guesses", () => {
    expect(computeWrappedStats(solvedOn(days(5)), noTypes).stats?.clock).toBeNull();
  });

  test("unsolved days never appear in clock", () => {
    // The unsolved day has a 10-minute gap, longer than the solve; it must not be picked as longest.
    const rows = [
      g("2026-03-01", 1, { time: "12:00:00" }),
      g("2026-03-01", 2, { time: "12:10:00" }),
      g("2026-03-02", 1, { time: "12:00:00" }),
      g("2026-03-02", 2, { time: "12:03:00", ok: true, p: 9 }),
      ...playedOn(days(3, 3)),
    ];
    expect(computeWrappedStats(rows, noTypes).stats?.clock).toEqual({
      fastest: { ms: 180000, date: "2026-03-02", pokemonId: 9 },
      longest: null,
    });
  });

  test("average is the mean guesses over solved live days, rounded to one decimal", () => {
    const rows = [
      ...solvedIn("2026-03-01", 3),
      ...solvedIn("2026-03-02", 4),
      ...solvedIn("2026-03-03", 4),
      ...solvedIn("2026-03-04", 5),
      ...playedOn(days(2, 5)),
    ];
    expect(computeWrappedStats(rows, noTypes).stats?.average).toBe(4);
  });

  test("average rounds 10/3 to 3.3", () => {
    const rows = [...solvedIn("2026-03-01", 3), ...solvedIn("2026-03-02", 3), ...solvedIn("2026-03-03", 4), ...playedOn(days(2, 4))];
    expect(computeWrappedStats(rows, noTypes).stats?.average).toBe(3.3);
  });

  test("average is null with no solved day, and finish is standard", () => {
    const stats = computeWrappedStats(playedOn(days(5)), noTypes).stats;
    expect(stats?.average).toBeNull();
    expect(stats?.finish).toBe("standard");
  });

  test("finish follows the exact mean and the 10-solved rule", () => {
    const ten = days(10).flatMap((d) => solvedIn(d, 3));
    expect(computeWrappedStats(ten, noTypes).stats?.finish).toBe("rainbow");

    const nine = [...days(9).flatMap((d) => solvedIn(d, 3)), ...playedOn(days(3, 10))];
    expect(computeWrappedStats(nine, noTypes).stats?.finish).toBe("standard");

    // 24 solves in 4 and one in 3: a mean of 3.96, shown as 4.0, still under 4.0.
    const justUnder = [...days(24).flatMap((d) => solvedIn(d, 4)), ...solvedIn("2026-03-25", 3)];
    const stats = computeWrappedStats(justUnder, noTypes).stats;
    expect(stats?.average).toBe(4);
    expect(stats?.finish).toBe("rainbow");
  });

  test("clock is null when the only 2+ guess solve took over an hour", () => {
    const rows = [
      g("2026-03-01", 1, { time: "12:00:00" }),
      g("2026-03-01", 2, { time: "13:01:00", ok: true }),
      ...playedOn(days(4, 2)),
    ];
    expect(computeWrappedStats(rows, noTypes).stats?.clock).toBeNull();
  });

  test("equal fastest times go to the earlier date, and equal longest times too", () => {
    const battle = (day: string, minutes: number, p = 1) => [
      g(day, 1, { time: "12:00:00" }),
      g(day, 2, { time: `12:${String(minutes).padStart(2, "0")}:00`, ok: true, p }),
    ];
    const rows = [
      ...battle("2026-03-01", 3, 11),
      ...battle("2026-03-02", 3, 12),
      ...battle("2026-03-03", 9, 13),
      ...battle("2026-03-04", 9, 14),
      ...playedOn(days(1, 5)),
    ];
    const clock = computeWrappedStats(rows, noTypes).stats?.clock;
    expect(clock?.fastest).toEqual({ ms: 180000, date: "2026-03-01", pokemonId: 11 });
    expect(clock?.longest).toEqual({ ms: 540000, date: "2026-03-03", pokemonId: 13 });
  });

  test("a one-guess solve counts in the average", () => {
    const rows = [...solvedIn("2026-03-01", 1), ...solvedIn("2026-03-02", 4), ...playedOn(days(3, 3))];
    expect(computeWrappedStats(rows, noTypes).stats?.average).toBe(2.5);
  });
});
