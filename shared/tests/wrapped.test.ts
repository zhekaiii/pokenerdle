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
test("finish thresholds are exclusive and use the exact mean", () => {
  expect(getWrappedFinish(null, 200)).toBe("standard");
  expect(getWrappedFinish(5.5, 200)).toBe("standard");
  expect(getWrappedFinish(5.49, 200)).toBe("foil");
  expect(getWrappedFinish(4.5, 200)).toBe("foil");
  expect(getWrappedFinish(4.49, 200)).toBe("gold");
  expect(getWrappedFinish(4.0, 200)).toBe("gold");
  expect(getWrappedFinish(3.96, 200)).toBe("rainbow");
});
test("every finish above standard needs 10 solved days", () => {
  expect(getWrappedFinish(3.2, 9)).toBe("standard");
  expect(getWrappedFinish(5.0, 9)).toBe("standard");
  expect(getWrappedFinish(3.2, 10)).toBe("rainbow");
});
