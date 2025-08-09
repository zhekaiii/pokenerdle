import { differenceInCalendarDays } from "date-fns";

export const DAILY_CHALLENGE_KEY = "daily_challenge";
export const DAILY_CHALLENGE_GUESS_LIMIT = 8;

export const DAY_1 = new Date(2025, 7, 9);
export const challengeNumber = differenceInCalendarDays(new Date(), DAY_1) + 1;
