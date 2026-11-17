import { describe, expect, test } from "bun:test";
import type { WrappedResponse } from "@pokenerdle/shared/wrapped";
import {
  formatDay,
  formatDayRange,
  formatSolveClock,
  isMinutesClock,
  placeStreak,
  pokemonInfo,
  STRIP_MONTH_DAYS,
  STRIP_MONTH_EDGES,
  toLongestBattle,
  toSolveSeconds,
  toWrappedLang,
} from "../src/pages/Wrapped/format";

const response = (pokemon: WrappedResponse["pokemon"]): WrappedResponse => ({
  phase: "live",
  eligible: true,
  daysPlayed: 10,
  stats: null,
  simple: null,
  pokemon,
});

describe("toWrappedLang", () => {
  test("keeps the three supported codes and reads anything else as English", () => {
    expect(toWrappedLang("en")).toBe("en");
    expect(toWrappedLang("zh-Hans")).toBe("zh-Hans");
    expect(toWrappedLang("zh-Hant")).toBe("zh-Hant");
    expect(toWrappedLang("fr")).toBe("en");
    expect(toWrappedLang("")).toBe("en");
  });
});

describe("pokemonInfo", () => {
  const data = response({
    25: {
      names: { en: "Pikachu", "zh-Hans": "皮卡丘", "zh-Hant": "皮卡丘" },
      artwork: null,
      types: ["electric"],
    },
    6: {
      names: { en: "Charizard", "zh-Hans": "喷火龙", "zh-Hant": "噴火龍" },
      artwork: "https://example.test/6.png",
      types: ["fire", "flying"],
    },
  });

  test("picks the name for the language and passes the artwork on", () => {
    expect(pokemonInfo(data, 6, "zh-Hant")).toEqual({
      name: "噴火龍",
      artwork: "https://example.test/6.png",
    });
  });

  test("a missing artwork URL stays null so the screen shows the placeholder", () => {
    expect(pokemonInfo(data, 25, "en").artwork).toBeNull();
  });

  test("an unknown language falls back to English", () => {
    expect(pokemonInfo(data, 6, "fr").name).toBe("Charizard");
  });

  test("a Pokémon missing from the response still gets a name and no artwork", () => {
    expect(pokemonInfo(data, 999, "en")).toEqual({ name: "#999", artwork: null });
  });
});

describe("dates", () => {
  test("English reads day first", () => {
    expect(formatDay("en", "2026-05-12")).toBe("12 May");
  });

  test("the year is added on request", () => {
    expect(formatDay("en", "2025-12-31", true)).toBe("31 Dec 2025");
  });

  test("a range in one month names the month once", () => {
    // ICU versions differ in the spaces around the dash.
    expect(formatDayRange("en", "2026-03-04", "2026-03-26")).toMatch(
      /^4\s*[–-]\s*26 Mar$/,
    );
  });

  test("a one-day range is just the day", () => {
    expect(formatDayRange("en", "2026-03-04", "2026-03-04")).toBe("4 Mar");
  });

  test("Chinese uses month and day characters", () => {
    expect(formatDay("zh-Hans", "2026-03-04")).toBe("3月4日");
    expect(formatDay("zh-Hant", "2026-03-04")).toBe("3月4日");
  });
});

describe("solve times", () => {
  test("under a minute reads as seconds", () => {
    const seconds = toSolveSeconds(38_000);
    expect(seconds).toBe(38);
    expect(isMinutesClock(seconds)).toBe(false);
    expect(formatSolveClock(seconds, false)).toBe("38");
  });

  test("59.6 seconds rounds up into minutes rather than showing 60 seconds", () => {
    const seconds = toSolveSeconds(59_600);
    expect(isMinutesClock(seconds)).toBe(true);
    expect(formatSolveClock(seconds, true)).toBe("1:00");
  });

  test("a minute or more reads as minutes and padded seconds", () => {
    expect(formatSolveClock(65, true)).toBe("1:05");
    expect(formatSolveClock(754, true)).toBe("12:34");
  });

  test("a solve is never shown as 0 seconds", () => {
    expect(toSolveSeconds(120)).toBe(1);
  });

  test("the longest battle is whole minutes, or seconds when under a minute", () => {
    expect(toLongestBattle(9 * 60_000)).toEqual({ unit: "minutes", count: 9 });
    expect(toLongestBattle(9 * 60_000 + 59_000)).toEqual({
      unit: "minutes",
      count: 9,
    });
    expect(toLongestBattle(45_000)).toEqual({ unit: "seconds", count: 45 });
  });
});

describe("the year strip", () => {
  test("covers the 334 days from January to November", () => {
    expect(STRIP_MONTH_DAYS).toHaveLength(11);
    expect(STRIP_MONTH_DAYS.reduce((sum, days) => sum + days, 0)).toBe(334);
    expect(STRIP_MONTH_EDGES).toHaveLength(10);
    expect(STRIP_MONTH_EDGES[0]).toBeCloseTo(31 / 334);
  });

  test("places a streak by its first day and length", () => {
    const place = placeStreak({
      length: 23,
      start: "2026-03-04",
      end: "2026-03-26",
    });
    expect(place.start).toBeCloseTo(62 / 334); // 18.6%
    expect(place.length).toBeCloseTo(23 / 334); // 6.9%
    expect(place.centre).toBeCloseTo((62 + 11.5) / 334);
    expect(place.firstMonth).toBe(2);
    expect(place.lastMonth).toBe(2);
  });

  test("a streak across months marks every month it touches", () => {
    const place = placeStreak({
      length: 10,
      start: "2026-03-28",
      end: "2026-04-06",
    });
    expect([place.firstMonth, place.lastMonth]).toEqual([2, 3]);
  });

  test("a streak ending on the last day of the window ends at the strip's end", () => {
    const place = placeStreak({
      length: 4,
      start: "2026-11-27",
      end: "2026-11-30",
    });
    expect(place.start + place.length).toBeCloseTo(1);
    expect(place.lastMonth).toBe(10);
  });
});
