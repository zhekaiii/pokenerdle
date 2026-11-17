import {
  WRAPPED_WINDOW_DAYS,
  WRAPPED_WINDOW_END,
  WRAPPED_WINDOW_START,
  type WrappedLang,
  type WrappedResponse,
} from "@pokenerdle/shared/wrapped";

// Pure helpers the story screens share: language, dates, solve times and the streak strip.

const DAY_MS = 24 * 60 * 60 * 1000;

// i18n.language is one of the three supported codes; anything else reads English.
export const toWrappedLang = (language: string): WrappedLang =>
  language === "zh-Hans" || language === "zh-Hant" ? language : "en";

// The English copy writes dates day first ("4 Mar"), as the rest of the story does.
const dateLocale = (language: string) =>
  toWrappedLang(language) === "en" ? "en-GB" : language;

// Dates arrive as yyyy-MM-dd Singapore dates. Reading them as UTC midnight and formatting
// in UTC keeps the day the same in every time zone.
const asUtc = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`);

const dayFormat = (language: string, withYear: boolean) =>
  new Intl.DateTimeFormat(dateLocale(language), {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" as const } : {}),
    timeZone: "UTC",
  });

export const formatDay = (language: string, isoDate: string, withYear = false) =>
  dayFormat(language, withYear).format(asUtc(isoDate));

export const formatDayRange = (language: string, start: string, end: string) =>
  start === end
    ? formatDay(language, start)
    : dayFormat(language, false).formatRange(asUtc(start), asUtc(end));

// Name and artwork for one Pokémon. A Pokémon the response forgot to include still renders:
// the name falls back to its number and the artwork to null, which shows the placeholder.
export const pokemonInfo = (
  data: WrappedResponse,
  id: number,
  language: string,
): { name: string; artwork: string | null } => {
  const info = data.pokemon[id];
  return {
    name: info?.names[toWrappedLang(language)] || `#${id}`,
    artwork: info?.artwork ?? null,
  };
};

// Seconds for the fastest-solve screen. Times under a minute read as seconds, and longer
// ones as minutes and seconds.
export const toSolveSeconds = (ms: number) => Math.max(1, Math.round(ms / 1000));
export const isMinutesClock = (seconds: number) => seconds >= 60;

export const formatSolveClock = (seconds: number, asMinutes: boolean) =>
  asMinutes
    ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
    : String(seconds);

// The longest battle in whole units: seconds when it was under a minute, otherwise
// completed minutes.
export const toLongestBattle = (
  ms: number,
): { unit: "seconds" | "minutes"; count: number } => {
  const seconds = toSolveSeconds(ms);
  return seconds < 60
    ? { unit: "seconds", count: seconds }
    : { unit: "minutes", count: Math.floor(seconds / 60) };
};

// The year strip covers the months from the window's first month to its last, one position
// per day of the window. The window sits within one year.
const WINDOW_START = asUtc(WRAPPED_WINDOW_START);
const WINDOW_FIRST_MONTH = WINDOW_START.getUTCMonth();
const WINDOW_MONTHS = asUtc(WRAPPED_WINDOW_END).getUTCMonth() - WINDOW_FIRST_MONTH + 1;
export const STRIP_MONTH_DAYS = Array.from(
  { length: WINDOW_MONTHS },
  (_, month) =>
    new Date(
      Date.UTC(WINDOW_START.getUTCFullYear(), WINDOW_FIRST_MONTH + month + 1, 0),
    ).getUTCDate(),
);

// Where each month ends along the strip, as a fraction of it. The last month ends at the
// strip's own end, so it has no edge.
export const STRIP_MONTH_EDGES = STRIP_MONTH_DAYS.slice(0, -1).map(
  (_, month) =>
    STRIP_MONTH_DAYS.slice(0, month + 1).reduce((sum, days) => sum + days, 0) /
    WRAPPED_WINDOW_DAYS,
);

const dayIndex = (isoDate: string) =>
  Math.round((asUtc(isoDate).getTime() - asUtc(WRAPPED_WINDOW_START).getTime()) / DAY_MS);

export interface StreakPlacement {
  start: number; // where the block starts, as a fraction of the strip
  length: number; // how wide it is, as a fraction of the strip
  centre: number; // the middle of the block, where the flag points
  firstMonth: number; // 0-based, the window's first month is 0
  lastMonth: number;
}

export const placeStreak = (streak: {
  length: number;
  start: string;
  end: string;
}): StreakPlacement => {
  const start = Math.min(Math.max(dayIndex(streak.start), 0), WRAPPED_WINDOW_DAYS - 1);
  const length = streak.length / WRAPPED_WINDOW_DAYS;
  return {
    start: start / WRAPPED_WINDOW_DAYS,
    length,
    centre: start / WRAPPED_WINDOW_DAYS + length / 2,
    firstMonth: asUtc(streak.start).getUTCMonth() - WINDOW_FIRST_MONTH,
    lastMonth: asUtc(streak.end).getUTCMonth() - WINDOW_FIRST_MONTH,
  };
};
