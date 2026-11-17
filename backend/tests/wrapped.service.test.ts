import { afterAll, beforeAll, beforeEach, describe, expect, mock, setSystemTime, test } from "bun:test";
import type { WrappedGuessRow } from "../src/repositories/daily.repository.js";

const getUserGuessesInWindow = mock(async (): Promise<WrappedGuessRow[]> => []);
const getUserFirstGuess = mock(async (): Promise<{ pokemonId: number; createdAt: Date } | null> => null);
mock.module("../src/repositories/daily.repository.js", () => ({ getUserGuessesInWindow, getUserFirstGuess }));

const getPokemonTypes = mock(async (ids: number[]) => new Map(ids.map((id) => [id, ["normal"]])));
const getWrappedPokemonInfo = mock(async (ids: number[]) =>
  new Map(
    ids.map((id) => [
      id,
      { types: ["normal"], names: { en: `en-${id}`, "zh-Hans": `hans-${id}`, "zh-Hant": `hant-${id}` }, artwork: `art-${id}` },
    ]),
  ),
);
mock.module("../src/repositories/pokemon.repository.js", () => ({ getPokemonTypes, getWrappedPokemonInfo }));

const { getWrappedService, resolveWrappedWindow } = await import("../src/services/wrapped.service.js");

const row = (day: string, guessNumber: number, pokemonId: number, o: { ok?: boolean; time?: string } = {}): WrappedGuessRow => ({
  dailyChallengeId: day,
  guessNumber,
  pokemonId,
  isCorrect: o.ok ?? false,
  createdAt: new Date(`${day}T${o.time ?? "12:00:00"}+08:00`),
});
const marchDays = (n: number) => Array.from({ length: n }, (_, i) => `2026-03-${String(i + 1).padStart(2, "0")}`);
// Each day: guess 1 at 12:00:00 (pokemon 1), then a solving guess 2 minutes later (pokemon 100 + day index).
const solvedDays = (n: number): WrappedGuessRow[] =>
  marchDays(n).flatMap((day, i) => [row(day, 1, 1), row(day, 2, 100 + i, { ok: true, time: "12:03:00" })]);

const originalNodeEnv = process.env.NODE_ENV;
beforeAll(() => {
  delete process.env.NODE_ENV;
  setSystemTime(new Date("2026-12-05T04:00:00Z")); // after the window, so outside production windowEnd is 2026-11-30
});
afterAll(() => {
  setSystemTime();
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;
});
beforeEach(() => {
  getWrappedPokemonInfo.mockClear();
  getUserGuessesInWindow.mockReset().mockResolvedValue([]);
  getUserFirstGuess.mockReset().mockResolvedValue(null);
});

describe("resolveWrappedWindow", () => {
  test("production follows the launch gate", () => {
    expect(resolveWrappedWindow("2026-11-30", true)).toEqual({ phase: "before", windowEnd: "2026-11-30" });
    expect(resolveWrappedWindow("2026-12-01", true)).toEqual({ phase: "live", windowEnd: "2026-11-30" });
    expect(resolveWrappedWindow("2027-01-01", true)).toEqual({ phase: "closed", windowEnd: "2026-11-30" });
  });

  test("outside production it is always live, capped at yesterday", () => {
    expect(resolveWrappedWindow("2026-11-14", false)).toEqual({ phase: "live", windowEnd: "2026-11-13" });
    expect(resolveWrappedWindow("2026-12-20", false)).toEqual({ phase: "live", windowEnd: "2026-11-30" });
  });
});

describe("getWrappedService", () => {
  test("a player with no guesses gets an empty, valid response", async () => {
    expect(await getWrappedService("posthog_x")).toEqual({
      phase: "live",
      eligible: false,
      daysPlayed: 0,
      stats: null,
      simple: null,
      pokemon: {},
    });
    expect(getUserGuessesInWindow).toHaveBeenCalledWith("posthog_x", "2026-01-01", "2026-11-30");
  });

  test("under 5 live days with a first guess gets the simplified response", async () => {
    getUserGuessesInWindow.mockResolvedValue(solvedDays(4));
    getUserFirstGuess.mockResolvedValue({ pokemonId: 445, createdAt: new Date("2026-12-02T16:30:00Z") });

    const result = await getWrappedService("u");

    expect(result.eligible).toBe(false);
    expect(result.daysPlayed).toBe(4);
    expect(result.stats).toBeNull();
    expect(result.simple).toEqual({ pokemonId: 445, date: "2026-12-03" });
    expect(Object.keys(result.pokemon)).toEqual(["445"]);
    expect(result.pokemon[445].names.en).toBe("en-445");
  });

  test("a first-guess Pokemon that is also in the window is loaded once", async () => {
    getUserGuessesInWindow.mockResolvedValue(solvedDays(4));
    getUserFirstGuess.mockResolvedValue({ pokemonId: 1, createdAt: new Date("2026-03-01T04:00:00Z") });

    const result = await getWrappedService("u");

    expect(result.simple).toEqual({ pokemonId: 1, date: "2026-03-01" });
    expect(Object.keys(result.pokemon)).toEqual(["1"]);
    expect(getWrappedPokemonInfo).toHaveBeenCalledTimes(1);
    expect(getWrappedPokemonInfo).toHaveBeenCalledWith([1]);
  });

  test("an eligible player has simple null", async () => {
    getUserGuessesInWindow.mockResolvedValue(solvedDays(10));

    const result = await getWrappedService("u");

    expect(result.eligible).toBe(true);
    expect(result.simple).toBeNull();
    expect(result.stats?.daysPlayed).toBe(10);
    expect(getUserFirstGuess).not.toHaveBeenCalled();
  });

  test("pokemon contains exactly the ids referenced in stats", async () => {
    getUserGuessesInWindow.mockResolvedValue(solvedDays(10));

    const { stats, pokemon } = await getWrappedService("u");

    const referenced = new Set<number>([
      stats!.opener.pokemonId,
      ...stats!.mostGuessed,
      stats!.clock!.fastest.pokemonId,
      ...(stats!.clock!.longest ? [stats!.clock!.longest.pokemonId] : []),
    ]);
    expect(referenced.size).toBeGreaterThan(3);
    expect(Object.keys(pokemon).map(Number).sort((a, b) => a - b)).toEqual([...referenced].sort((a, b) => a - b));
  });

  test("outside the live phase it answers without querying", async () => {
    process.env.NODE_ENV = "production";
    setSystemTime(new Date("2026-11-20T04:00:00Z"));
    try {
      expect(await getWrappedService("u")).toEqual({
        phase: "before",
        eligible: false,
        daysPlayed: 0,
        stats: null,
        simple: null,
        pokemon: {},
      });
      expect(getUserGuessesInWindow).not.toHaveBeenCalled();
    } finally {
      delete process.env.NODE_ENV;
      setSystemTime(new Date("2026-12-05T04:00:00Z"));
    }
  });
});
