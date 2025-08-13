import { differenceInCalendarDays } from "date-fns";

export const DAILY_CHALLENGE_KEY = "daily_challenge";
export const DAILY_CHALLENGE_GUESS_LIMIT = 8;

export const DAY_1 = new Date(2025, 7, 9);
export const challengeNumber = differenceInCalendarDays(new Date(), DAY_1) + 1;

export const COLUMNS = [
  { label: "Type 1", key: "type1Correctness" },
  { label: "Type 2", key: "type2Correctness" },
  { label: "Gen", key: "genCorrectness" },
  { label: "Color", key: "colorCorrectness" },
  { label: "Height", key: "heightCorrectness" },
] as const;
