export const MIN_GENERATION = 1;
export const MAX_GENERATION = 9;
export const GENERATIONS = Array.from(
  { length: MAX_GENERATION },
  (_, i) => MIN_GENERATION + i,
);
