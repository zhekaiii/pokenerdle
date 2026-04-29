import { TZDate } from "@date-fns/tz";
import {
  DAILY_CHALLENGE_DAY_1,
  SINGAPORE_TIMEZONE,
} from "@pokenerdle/shared/date";
import { differenceInCalendarDays } from "date-fns";

export const DAILY_CHALLENGE_KEY = "daily_challenge";
export const DAILY_CHALLENGE_GUESS_LIMIT = 8;

export const DAILY_CALENDAR_QUERY_KEY = "dailyCalendar";

export const DAY_1 = new TZDate(DAILY_CHALLENGE_DAY_1, SINGAPORE_TIMEZONE);

export const getChallengeNumber = (date: string) =>
  differenceInCalendarDays(new TZDate(date, SINGAPORE_TIMEZONE), DAY_1) + 1;

export const COLUMNS = [
  { label: "columns.type1", key: "type1Correctness" },
  { label: "columns.type2", key: "type2Correctness" },
  { label: "columns.gen", key: "genCorrectness" },
  { label: "columns.color", key: "colorCorrectness" },
  { label: "columns.height", key: "heightCorrectness" },
] as const;
