import { pokemon_v2_ability, pokemon_v2_pokemon } from "@prisma/client";

export type PokemonWithAbilities = pokemon_v2_pokemon & {
  abilities: pokemon_v2_ability[];
};

export const isTruthy = <T>(value: T | null | undefined): value is T =>
  Boolean(value);
