import { STAT_KEYS, StatGuessStats, StatKey } from "@pokenerdle/shared";

export const TOLERANCE = 60;

export type StatColor = "green" | "yellow" | "gray";

export interface StatBreakdown {
  stat: StatKey;
  guess: number;
  actual: number;
  delta: number;
  closeness: number; // 0..1
  color: StatColor;
}

export interface StatGuessScore {
  overallPercent: number;
  perStat: StatBreakdown[];
}

export const closenessForStat = (guess: number, actual: number): number => {
  const delta = Math.abs(guess - actual);
  const v = 1 - (delta / TOLERANCE) ** 2;
  return Math.max(0, v);
};

export const colorForCloseness = (closeness: number): StatColor => {
  if (closeness >= 0.85) return "green";
  if (closeness >= 0.5) return "yellow";
  return "gray";
};

export const computeScore = (
  guesses: StatGuessStats,
  actual: StatGuessStats,
): StatGuessScore => {
  const perStat: StatBreakdown[] = STAT_KEYS.map((stat) => {
    const guess = guesses[stat];
    const actualValue = actual[stat];
    const closeness = closenessForStat(guess, actualValue);
    return {
      stat,
      guess,
      actual: actualValue,
      delta: Math.abs(guess - actualValue),
      closeness,
      color: colorForCloseness(closeness),
    };
  });
  const avg = perStat.reduce((sum, s) => sum + s.closeness, 0) / perStat.length;
  return {
    overallPercent: Math.round(avg * 100),
    perStat,
  };
};
