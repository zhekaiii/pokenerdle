import { TZDate } from "@date-fns/tz";
import { SINGAPORE_TIMEZONE } from "@pokenerdle/shared/date";
import { addDays, format } from "date-fns";

export const singaporeDate = (instant: Date): string =>
  format(new TZDate(instant, SINGAPORE_TIMEZONE), "yyyy-MM-dd");

// Noon UTC keeps the calendar date stable whatever the server's time zone.
export const addDaysToIsoDate = (day: string, n: number): string =>
  addDays(new Date(`${day}T12:00:00Z`), n).toISOString().slice(0, 10);
