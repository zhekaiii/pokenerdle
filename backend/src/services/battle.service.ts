import { clamp } from "@pokenerdle/shared/utils/index.js";
import {
  BattleRoom,
  InvalidAnswer,
  TurnResult,
  ValidAnswer,
} from "../controllers/types.js";

type PositivePointModifier = {
  condition?: (result: ValidAnswer) => boolean;
  pointModifier: (points: number, room: BattleRoom) => number;
};

type NegativePointModifier = {
  condition?: (result: InvalidAnswer) => boolean;
  pointModifier: (points: number, room: BattleRoom) => number;
};

const INVALID_ANSWER_MODIFIER: NegativePointModifier = {
  condition: (result: InvalidAnswer) => !result.validAnswer,
  pointModifier: () => -10,
};

const VALID_ANSWER_MODIFIER: PositivePointModifier = {
  pointModifier: () => 100,
};

const LEGENDARY_MYTHICAL_MODIFIER: PositivePointModifier = {
  condition: (result: ValidAnswer) =>
    !!(result.species?.is_legendary || result.species?.is_mythical),
  pointModifier: (points: number) => points + 100,
};

const FAST_ANSWER_MODIFIER: PositivePointModifier = {
  pointModifier: (points: number, room: BattleRoom) => {
    const timeTakenSec = (Date.now() - room.turnStart) / 1000;
    const timeLimitSec = room.settings.timer;
    return Math.round(points * (1 - timeTakenSec / timeLimitSec / 2));
  },
};

const STREAK_MODIFIER: PositivePointModifier = {
  pointModifier: (points: number, room: BattleRoom) => {
    const streak = room.streak[room.turn];
    return (points *= 1 + clamp(streak - 2, 0, 5) * 0.1);
  },
};

const NEGATIVE_MODIFIERS: NegativePointModifier[] = [INVALID_ANSWER_MODIFIER];

const POSITIVE_MODIFIERS: PositivePointModifier[] = [
  VALID_ANSWER_MODIFIER,
  LEGENDARY_MYTHICAL_MODIFIER,
  STREAK_MODIFIER,
  FAST_ANSWER_MODIFIER,
];

export const getPoints = (result: TurnResult, room: BattleRoom) => {
  const modifiers = result.validAnswer
    ? POSITIVE_MODIFIERS
    : NEGATIVE_MODIFIERS;
  const points = modifiers.reduce((points, modifier) => {
    // @ts-expect-error -- This is safe because we check for result.validAnswer before
    if (!modifier.condition || modifier.condition(result)) {
      return modifier.pointModifier(points, room);
    }
    return points;
  }, 0);
  console.log(`Points awarded: ${points}`);
  return points;
};
