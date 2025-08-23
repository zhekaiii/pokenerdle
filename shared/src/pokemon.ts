export type PokemonNamesResponse = {
  id: number;
  name: string;
  speciesName: string;
};

type Pokemon = {
  name: string;
  id: number;
  pokemon_species_id: number | null;
};

type Ability = {
  name: string;
  id: number;
};

export type PokemonWithAbilities = Pokemon & {
  abilities: Ability[];
  speciesName: string;
  sprites: Record<string, string | null | Record<string, any>>;
};

export type PathFinderResponse = {
  startPokemon: PokemonWithAbilities;
  endPokemon: PokemonWithAbilities;
  pathLength: number;
};

export type PokemonIdsByGenerationResponse = number[];
