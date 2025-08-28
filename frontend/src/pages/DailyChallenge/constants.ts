import { differenceInCalendarDays, format } from "date-fns";

export const DAILY_CHALLENGE_KEY = "daily_challenge";
export const DAILY_CHALLENGE_GUESS_LIMIT = 8;

export const DAY_1 = new Date(2025, 7, 9);
export const FROZEN_DATE = format(new Date(), "yyyy-MM-dd");
export const challengeNumber =
  differenceInCalendarDays(new Date(FROZEN_DATE), DAY_1) + 1;

export const COLUMNS = [
  { label: "type1", key: "type1Correctness" },
  { label: "type2", key: "type2Correctness" },
  { label: "gen", key: "genCorrectness" },
  { label: "color", key: "colorCorrectness" },
  { label: "height", key: "heightCorrectness" },
] as const;
