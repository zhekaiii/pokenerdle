import {
  WRAPPED_FOIL_MAX_AVG,
  type WrappedStats,
} from "@pokenerdle/shared/wrapped";

export type ScreenId =
  | "opener"
  | "showingUp"
  | "streak"
  | "signature"
  | "types"
  | "clock"
  | "average"
  | "thanks"
  | "firstGuess"
  | "card";

// The simplified story, for players with too few live days for the full one.
export const SIMPLE_SCREENS: ScreenId[] = [
  "opener",
  "firstGuess",
  "thanks",
  "card",
];

// The full story. Screens with nothing flattering to say are left out (spec section 4,
// "Weak results"): no streak under the minimum, no clock without a solve, and no average
// worse than the weakest card finish.
export const buildScreens = (stats: WrappedStats): ScreenId[] => {
  const screens: ScreenId[] = ["opener", "showingUp"];
  if (stats.streak) screens.push("streak");
  screens.push("signature", "types");
  if (stats.clock) screens.push("clock");
  if (stats.average !== null && stats.average <= WRAPPED_FOIL_MAX_AVG) {
    screens.push("average");
  }
  screens.push("thanks", "card");
  return screens;
};
