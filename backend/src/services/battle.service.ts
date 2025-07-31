import { BattleRoom, TurnResult } from "../controllers/types.js";

type PointModifier = {
  condition: (result: TurnResult) => boolean;
  pointModifier: (points: number, room: BattleRoom) => number;
};

const INVALID_ANSWER_MODIFIER: PointModifier = {
  condition: (result: TurnResult) => !result.validAnswer,
  pointModifier: (points: number) => points - 10,
};

const VALID_ANSWER_MODIFIER: PointModifier = {
  condition: (result: TurnResult) => result.validAnswer,
  pointModifier: (points: number) => points + 100,
};

const LEGENDARY_MYTHICAL_MODIFIER: PointModifier = {
  condition: (result: TurnResult) =>
    result.validAnswer &&
    !!(result.species?.is_legendary || result.species?.is_mythical),
  pointModifier: (points: number) => points + 100,
};

const FAST_ANSWER_MODIFIER: PointModifier = {
  condition: (result: TurnResult) => result.validAnswer,
  pointModifier: (points: number, room: BattleRoom) => {
    const timeTakenSec = (Date.now() - room.turnStart) / 1000;
    const timeLimitSec = room.settings.timer;
    return Math.round(points * (1 - timeTakenSec / timeLimitSec / 2));
  },
};

export const getPoints = (result: TurnResult, room: BattleRoom) => {
  let basePoints = 0;
  const modifiers = [
    INVALID_ANSWER_MODIFIER,
    VALID_ANSWER_MODIFIER,
    LEGENDARY_MYTHICAL_MODIFIER,
    FAST_ANSWER_MODIFIER,
  ];
  basePoints = modifiers.reduce((points, modifier) => {
    if (modifier.condition(result)) {
      return modifier.pointModifier(points, room);
    }
    return points;
  }, basePoints);
  console.log(`Points awarded: ${basePoints}`);
  return basePoints;
};
