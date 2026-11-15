import { describe, expect, test } from "bun:test";
import { dailyNoticeQueryKey } from "../src/pages/DailyChallenge/hooks/useDailyNotice";

describe("dailyNoticeQueryKey", () => {
  test("includes auth state so a signed-in notice is not reused after sign-out", () => {
    expect(dailyNoticeQueryKey(true)).toEqual(["notice", "daily", true]);
    expect(dailyNoticeQueryKey(true)).not.toEqual(dailyNoticeQueryKey(false));
  });
});
