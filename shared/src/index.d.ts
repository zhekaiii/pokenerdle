import { pokemon_v2_ability, pokemon_v2_pokemon } from "./generated/prisma";

export type PokemonWithAbilities = pokemon_v2_pokemon & {
  abilities: pokemon_v2_ability[];
  speciesName: string;
};
