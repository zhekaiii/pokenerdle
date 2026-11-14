import { expect, test } from "bun:test";
import { getWrappedFinish, getWrappedPhase, roundAverage } from "../src/wrapped";

test("phase flips at the launch and close dates", () => {
  expect(getWrappedPhase("2026-11-30")).toBe("before");
  expect(getWrappedPhase("2026-12-01")).toBe("live");
  expect(getWrappedPhase("2026-12-31")).toBe("live");
  expect(getWrappedPhase("2027-01-01")).toBe("closed");
});
test("average rounds to one decimal", () => {
  expect(roundAverage(3.96)).toBe(4);
  expect(roundAverage(4.04)).toBe(4);
  expect(roundAverage(4.449)).toBe(4.4);
});
test("finish thresholds are inclusive and use the rounded average", () => {
  expect(getWrappedFinish(null, 200)).toBe("standard");
  expect(getWrappedFinish(4.6, 200)).toBe("standard");
  expect(getWrappedFinish(4.5, 200)).toBe("foil");
  expect(getWrappedFinish(4.1, 200)).toBe("foil");
  expect(getWrappedFinish(4.0, 200)).toBe("gold");
  expect(getWrappedFinish(3.6, 200)).toBe("gold");
  expect(getWrappedFinish(3.5, 200)).toBe("rainbow");
});
test("gold and rainbow need 30 days, otherwise foil", () => {
  expect(getWrappedFinish(3.2, 29)).toBe("foil");
  expect(getWrappedFinish(3.9, 29)).toBe("foil");
  expect(getWrappedFinish(3.2, 30)).toBe("rainbow");
});
