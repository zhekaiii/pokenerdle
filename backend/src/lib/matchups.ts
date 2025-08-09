import { getDamageFactor } from "../repositories/pokemon.repository.js";

export const getOverallTypeEffectiveness = async (
  attackingTypeId: number,
  defendingTypeId1: number,
  defendingTypeId2?: number | null
) => {
  const [multiplier1, multiplier2] = await Promise.all([
    getDamageFactor(attackingTypeId, defendingTypeId1),
    defendingTypeId2 ? getDamageFactor(attackingTypeId, defendingTypeId2) : 1,
  ]);
  return multiplier1 * multiplier2;
};
