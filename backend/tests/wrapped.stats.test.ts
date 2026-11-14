import { describe, expect, test } from "bun:test";
import { computeWrappedStats, type WrappedGuessRow } from "../src/services/wrapped.stats.js";

// A guess on `day`, made at `time` Singapore time on that same day unless `on` names another date.
const g = (day: string, guessNumber: number, o: { p?: number; ok?: boolean; time?: string; on?: string } = {}): WrappedGuessRow => ({
  dailyChallengeId: day, guessNumber, pokemonId: o.p ?? 1, isCorrect: o.ok ?? false,
  createdAt: new Date(`${o.on ?? day}T${o.time ?? "12:00:00"}+08:00`),
});
const days = (n: number, start = 1) => Array.from({ length: n }, (_, i) => `2026-03-${String(start + i).padStart(2, "0")}`);
const noTypes = () => [];

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
});
