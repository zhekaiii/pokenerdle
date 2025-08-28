import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import { LanguageId } from "../lib/constants.js";
import { prisma } from "../lib/prisma.js";
import { DailyPokemon } from "../utils/types.js";

export const DailyPokemonToResponse = async (
  pokemon: DailyPokemon
): Promise<DailyChallengeGuessResponse["pokemon"]> => {
  const { name: color } = await prisma.pokemon_v2_pokemoncolor.findFirstOrThrow(
    {
      where: {
        id: pokemon.pokemon_v2_pokemonspecies!.pokemon_color_id!,
      },
    }
  );

  const nestedTypes = await prisma.pokemon_v2_pokemontype.findMany({
    where: {
      pokemon_id: pokemon.id,
    },
    select: {
      pokemon_v2_type: {
        select: {
          pokemon_v2_typename: {
            select: {
              name: true,
            },
            where: {
              language_id: LanguageId.English,
            },
          },
        },
      },
    },
    orderBy: {
      slot: "asc",
    },
  });
  const types = nestedTypes.map(
    ({ pokemon_v2_type }) =>
      pokemon_v2_type?.pokemon_v2_typename[0].name ?? null
  );

  return {
    type1: types[0]!,
    type2: types[1],
    color,
    height: pokemon.height,
    generationId:
      pokemon.pokemon_v2_pokemonform[0].pokemon_v2_versiongroup?.generation_id!,
  };
};
