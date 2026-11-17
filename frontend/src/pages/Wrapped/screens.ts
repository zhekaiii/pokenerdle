import {
  WRAPPED_FOIL_MAX_AVG,
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

// The colour of a screen's plate and of the text on it.
export type Tone = "Red" | "Blue" | "Orange" | "Yellow" | "Purple" | "Green" | "Pink";

// Text colours follow the plate colour behind each screen.
export const TONE: Record<ScreenId, Tone> = {
  opener: "Red",
  showingUp: "Blue",
  firstGuess: "Blue",
  streak: "Orange",
  signature: "Yellow",
  types: "Purple",
  clock: "Green",
  average: "Pink",
  thanks: "Red",
  card: "Yellow",
};

// The simplified story, for players with too few live days for the full one.
export const SIMPLE_SCREENS: ScreenId[] = [
  "opener",
  "firstGuess",
  "thanks",
  "card",
];

// Whether the average is good enough to show. Uses the rounded `average`, which is what the
// player sees. The card finish is set from the exact mean in shared getWrappedFinish, so the
// two can disagree right at the edge.
export const hasFlatteringAverage = (
  stats: WrappedStats,
): stats is WrappedStats & { average: number } =>
  stats.average !== null && stats.average <= WRAPPED_FOIL_MAX_AVG;

// The full story. A screen with nothing flattering to say is left out: no streak under the
// minimum (the backend sends null for those), no clock without a solve in 2+ guesses within
// an hour, and no average above the weakest card finish.
export const buildScreens = (stats: WrappedStats): ScreenId[] => {
  const screens: ScreenId[] = ["opener", "showingUp"];
  if (stats.streak) screens.push("streak");
  screens.push("signature", "types");
  if (stats.clock) screens.push("clock");
  if (hasFlatteringAverage(stats)) screens.push("average");
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
// this order. A row with nothing flattering to show is left out, so fewer than three
// can appear.
export const pickCardRows = (stats: WrappedStats): CardRow[] => {
  const candidates: (CardRow | false)[] = [
    !!stats.streak && {
      kind: "streak",
      days: stats.streak.length,
    },
    stats.topTypes.length > 0 && { kind: "type", type: stats.topTypes[0].type },
    hasFlatteringAverage(stats) && {
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
