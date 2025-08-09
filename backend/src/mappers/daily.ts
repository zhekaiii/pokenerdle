import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import { LanguageId } from "../lib/constants.js";
import { prisma } from "../lib/prisma.js";
import { DailyPokemon, isTruthy } from "../utils/types.js";

export const DailyPokemonToResponse = async (
  pokemon: DailyPokemon
): Promise<DailyChallengeGuessResponse["pokemon"]> => {
  const { name: color } =
    await prisma.pokemon_v2_pokemoncolorname.findFirstOrThrow({
      where: {
        pokemon_color_id: pokemon.pokemon_v2_pokemonspecies!.pokemon_color_id!,
        language_id: LanguageId.English,
      },
    });

  const types = await prisma.pokemon_v2_typename.findMany({
    where: {
      type_id: {
        in: pokemon.pokemon_v2_pokemontype
          .map(({ type_id }) => type_id)
          .filter(isTruthy),
      },
      language_id: LanguageId.English,
    },
  });

  return {
    type1: types[0].name,
    type2: types[1]?.name,
    color,
    height: pokemon.height,
    generationId:
      pokemon.pokemon_v2_pokemonform[0].pokemon_v2_versiongroup?.generation_id!,
  };
};
