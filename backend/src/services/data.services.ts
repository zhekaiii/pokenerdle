import { PokemonWithAbilities } from "@pokenerdle/shared";
import { MAX_LINKS } from "../controllers/types.js";
import { isTruthy } from "../utils/types.js";

export const getPokemonNames = async () => {
  const pokemons = await prisma.pokemon_v2_pokemon.findMany({
    select: { name: true },
    orderBy: { id: "asc" },
  });
  return pokemons.map(({ name }) => name);
};

export const getStarterPokemon = async (): Promise<PokemonWithAbilities> => {
  const [{ pokemon_id: pokemonId }]: { pokemon_id: number }[] =
    await prisma.$queryRaw`SELECT pokemon_id FROM pokemon_v2_pokemonability GROUP BY pokemon_id HAVING COUNT(DISTINCT ability_id) > 1 ORDER BY RANDOM() LIMIT 1;`;
  const pokemon = await prisma.pokemon_v2_pokemon.findUnique({
    where: { id: pokemonId },
    include: {
      pokemon_v2_pokemonability: {
        select: { pokemon_v2_ability: true },
      },
      pokemon_v2_pokemonspecies: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!pokemon) {
    throw new Error("No starter Pokemon found");
  }

  return {
    ...pokemon,
    abilities: pokemon.pokemon_v2_pokemonability
      .map(({ pokemon_v2_ability }) => pokemon_v2_ability)
      .filter(isTruthy),
    speciesName: pokemon.pokemon_v2_pokemonspecies!.name,
  };
};

export const validatePokemon = async (
  pokemonName: string,
  previousPokemonName: string,
  usedLinks: Record<string, number>
) => {
  const [pokemon, previousPokemon] = await Promise.all([
    prisma.pokemon_v2_pokemon.findFirstOrThrow({
      where: { name: pokemonName },
      include: {
        pokemon_v2_pokemonability: {
          select: { pokemon_v2_ability: true },
        },
        pokemon_v2_pokemonspecies: {
          include: {
            pokemon_v2_pokemon: true,
          },
        },
      },
    }),
    prisma.pokemon_v2_pokemon.findFirstOrThrow({
      where: { name: previousPokemonName },
      include: {
        pokemon_v2_pokemonability: {
          select: { pokemon_v2_ability: true },
        },
      },
    }),
  ]);
  const commonAbilities = pokemon.pokemon_v2_pokemonability
    .map(({ pokemon_v2_ability }) => pokemon_v2_ability)
    .filter((ability) =>
      previousPokemon.pokemon_v2_pokemonability.some(
        ({ pokemon_v2_ability }) => pokemon_v2_ability?.id === ability?.id
      )
    )
    .filter(isTruthy);
  if (
    commonAbilities.length > 0 &&
    commonAbilities.every(
      (ability) => (usedLinks[ability.name] ?? 0) < MAX_LINKS
    )
  ) {
    commonAbilities.forEach((ability) => {
      usedLinks[ability.name] = Math.min(
        (usedLinks[ability.name] ?? 0) + 1,
        MAX_LINKS
      );
    });
    console.log(`${pokemonName} is a valid answer`);
    return [
      {
        ...pokemon,
        abilities: pokemon.pokemon_v2_pokemonability
          .map(({ pokemon_v2_ability }) => pokemon_v2_ability)
          .filter(isTruthy),
        speciesName: pokemon.pokemon_v2_pokemonspecies!.name,
      } as PokemonWithAbilities,
      pokemon.pokemon_v2_pokemonspecies?.pokemon_v2_pokemon.map(
        ({ name }) => name
      ) ?? [],
    ] as const;
  }
  console.log(
    `${pokemonName} is an invalid answer because ${
      commonAbilities.length > 0
        ? "all common abilities are used"
        : "no abilities are shared"
    }`
  );
  return pokemon.pokemon_v2_pokemonspecies!.name;
};
