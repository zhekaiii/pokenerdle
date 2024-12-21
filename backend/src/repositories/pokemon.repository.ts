import { PokemonNamesResponse, PokemonWithAbilities } from "@pokenerdle/shared";
import { pokemon_v2_ability, pokemon_v2_pokemon } from "@prisma/client";
import { isTruthy } from "../utils/types.js";

export const getPokemonNames = async () => {
  const pokemonDetails: PokemonNamesResponse[] = await prisma.$queryRaw`
    SELECT
      p.id,
      CASE
        WHEN COUNT(p.id) > 1
        OR COUNT(fn.id) = 0 THEN psn.name
        ELSE fn.pokemon_name
      END AS name,
      psn.name AS speciesName
    FROM
      pokemon_v2_pokemonform f
      INNER JOIN pokemon_v2_pokemon p ON p.id = f.pokemon_id
      LEFT JOIN pokemon_v2_pokemonformname fn ON f.id = fn.pokemon_form_id
      AND fn.language_id = 9
      INNER JOIN pokemon_v2_pokemonspecies ps ON ps.id = p.pokemon_species_id
      INNER JOIN pokemon_v2_pokemonspeciesname psn ON psn.pokemon_species_id = ps.id
    WHERE
      psn.language_id = 9
    GROUP BY
      p.id;
  `;
  return pokemonDetails;
};

export const getRandomPokemonIdWithMultipleAbilities = async () => {
  const result: [{ pokemon_id: number }] | [] =
    await prisma.$queryRaw`SELECT pokemon_id FROM pokemon_v2_pokemonability GROUP BY pokemon_id HAVING COUNT(DISTINCT ability_id) > 1 ORDER BY RANDOM() LIMIT 1;`;
  if (result.length == 0) {
    throw new Error("No starter Pokemon found");
  }
  return result[0].pokemon_id;
};

export const prettifyQueriedPokemon = <
  T extends pokemon_v2_pokemon & {
    pokemon_v2_pokemonability: {
      pokemon_v2_ability: pokemon_v2_ability | null;
    }[];
    pokemon_v2_pokemonspecies: { name: string } | null;
    pokemon_v2_pokemonsprites: { sprites: string }[];
  }
>(
  _pokemon: T
): PokemonWithAbilities => {
  const {
    pokemon_v2_pokemonability,
    pokemon_v2_pokemonspecies,
    pokemon_v2_pokemonsprites,
    ...pokemon
  } = _pokemon;
  return {
    ...pokemon,
    abilities: pokemon_v2_pokemonability
      .map(({ pokemon_v2_ability }) => pokemon_v2_ability)
      .filter(isTruthy),
    speciesName: pokemon_v2_pokemonspecies!.name,
    sprites: JSON.parse(pokemon_v2_pokemonsprites[0]?.sprites ?? "{}"),
  };
};

export const getPokemonWithAbilities = async (id: number) => {
  const pokemon = await prisma.pokemon_v2_pokemon.findUnique({
    where: { id },
    include: {
      pokemon_v2_pokemonability: {
        select: { pokemon_v2_ability: true },
      },
      pokemon_v2_pokemonspecies: {
        select: {
          name: true,
        },
      },
      pokemon_v2_pokemonsprites: {
        select: {
          sprites: true,
        },
      },
    },
  });
  return pokemon && prettifyQueriedPokemon(pokemon);
};

export const getPokemonIcons = async (): Promise<Record<number, string>> => {
  const sprites = await prisma.pokemon_v2_pokemonsprites.findMany();
  return Object.fromEntries(
    sprites.map(({ pokemon_id, sprites }) => [
      pokemon_id,
      JSON.parse(sprites).versions["generation-viii"].icons.front_default,
    ])
  );
};
