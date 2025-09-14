import { TZDate } from "@date-fns/tz";
import { SINGAPORE_TIMEZONE } from "@pokenerdle/shared/date";
import { differenceInCalendarDays, format } from "date-fns";

export const DAILY_CHALLENGE_KEY = "daily_challenge";
export const DAILY_CHALLENGE_GUESS_LIMIT = 8;

export const DAY_1 = new TZDate(2025, 7, 9, SINGAPORE_TIMEZONE);
export const FROZEN_DATE = format(TZDate.tz(SINGAPORE_TIMEZONE), "yyyy-MM-dd");
export const challengeNumber =
  differenceInCalendarDays(new TZDate(FROZEN_DATE, SINGAPORE_TIMEZONE), DAY_1) +
  1;

export const COLUMNS = [
  { label: "columns.type1", key: "type1Correctness" },
  { label: "columns.type2", key: "type2Correctness" },
  { label: "columns.gen", key: "genCorrectness" },
  { label: "columns.color", key: "colorCorrectness" },
  { label: "columns.height", key: "heightCorrectness" },
] as const;
