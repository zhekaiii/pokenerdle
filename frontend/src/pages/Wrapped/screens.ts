import {
  WRAPPED_FOIL_MAX_AVG,
  WRAPPED_MIN_STREAK,
  type WrappedFinish,
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

export type CardRow =
  | { kind: "streak"; days: number }
  | { kind: "type"; type: string }
  | { kind: "average"; value: number }
  | { kind: "unique"; count: number }
  | { kind: "solved"; days: number };

const CARD_ROWS = 3;

// The stat rows on the card: the first three that have something flattering to show, in
// this order (spec section 4, "Weak results"). Fewer than three when nothing else
// qualifies.
export const pickCardRows = (stats: WrappedStats): CardRow[] => {
  const candidates: (CardRow | false)[] = [
    !!stats.streak &&
      stats.streak.length >= WRAPPED_MIN_STREAK && {
        kind: "streak",
        days: stats.streak.length,
      },
    stats.topTypes.length > 0 && { kind: "type", type: stats.topTypes[0].type },
    stats.average !== null &&
      stats.average <= WRAPPED_FOIL_MAX_AVG && {
        kind: "average",
        value: stats.average,
      },
    stats.uniquePokemon > 0 && { kind: "unique", count: stats.uniquePokemon },
    stats.daysSolved >= 1 && { kind: "solved", days: stats.daysSolved },
  ];
  return candidates.filter((row): row is CardRow => row !== false).slice(0, CARD_ROWS);
};

const FINISHES: WrappedFinish[] = ["standard", "foil", "gold", "rainbow"];

// The finishes a player may show their card in: the one they earned and every one below it.
export const finishesUpTo = (earned: WrappedFinish): WrappedFinish[] =>
  FINISHES.slice(0, FINISHES.indexOf(earned) + 1);
