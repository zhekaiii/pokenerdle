import { describe, expect, test } from "bun:test";
import type { WrappedStats } from "@pokenerdle/shared/wrapped";
import { buildScreens, SIMPLE_SCREENS } from "../src/pages/Wrapped/screens";

const solve = { ms: 38_000, date: "2026-05-12", pokemonId: 448 };

const stats = (overrides: Partial<WrappedStats> = {}): WrappedStats => ({
  daysPlayed: 187,
  daysSolved: 171,
  uniquePokemon: 243,
  mostGuessed: [6, 94, 25, 130, 248, 149],
  streak: { length: 23, start: "2026-03-04", end: "2026-03-26" },
  opener: { pokemonId: 445, days: 64 },
  topTypes: [{ type: "dragon", share: 0.21 }],
  clock: { fastest: solve, longest: null },
  average: 3.9,
  finish: "gold",
  ...overrides,
});

describe("buildScreens", () => {
  test("a full year has all nine screens in order", () => {
    expect(buildScreens(stats())).toEqual([
      "opener",
      "showingUp",
      "streak",
      "signature",
      "types",
      "clock",
      "average",
      "thanks",
      "card",
    ]);
  });

  test("thanks is always directly before card", () => {
    const bare = buildScreens(stats({ streak: null, clock: null, average: null }));
    expect(bare.slice(-2)).toEqual(["thanks", "card"]);
    expect(buildScreens(stats()).slice(-2)).toEqual(["thanks", "card"]);
  });

  test("the full story never contains firstGuess", () => {
    expect(buildScreens(stats())).not.toContain("firstGuess");
    expect(
      buildScreens(stats({ streak: null, clock: null, average: null })),
    ).not.toContain("firstGuess");
  });

  test("streak is skipped when stats.streak is null", () => {
    expect(buildScreens(stats({ streak: null }))).not.toContain("streak");
  });

  test("clock is skipped when stats.clock is null", () => {
    expect(buildScreens(stats({ clock: null }))).not.toContain("clock");
  });

  test("average is skipped when the average is null or above 4.5", () => {
    expect(buildScreens(stats({ average: null }))).not.toContain("average");
    expect(buildScreens(stats({ average: 4.6 }))).not.toContain("average");
    expect(buildScreens(stats({ average: 4.5 }))).toContain("average");
  });

  test("opener, showingUp, signature, types, thanks and card are always present", () => {
    const bare = buildScreens(stats({ streak: null, clock: null, average: null }));
    expect(bare).toEqual([
      "opener",
      "showingUp",
      "signature",
      "types",
      "thanks",
      "card",
    ]);
  });
});

describe("SIMPLE_SCREENS", () => {
  test("is the four-screen story with the first guess before the thank-you", () => {
    expect(SIMPLE_SCREENS).toEqual(["opener", "firstGuess", "thanks", "card"]);
  });
});
