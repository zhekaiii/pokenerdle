import { pokemon_v2_ability, pokemon_v2_pokemon } from "@prisma/client";

export type PokemonNamesResponse = {
  id: number;
  name: string;
  speciesName: string;
};

export type PokemonWithAbilities = pokemon_v2_pokemon & {
  abilities: pokemon_v2_ability[];
  speciesName: string;
  sprites: Record<string, string | null | Record<string, any>>;
};

export type PathFinderResponse = {
  startPokemon: PokemonWithAbilities;
  endPokemon: PokemonWithAbilities;
  pathLength: number;
};
