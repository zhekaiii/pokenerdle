import Pokedex, { Ability, Pokemon } from "pokedex-promise-v2";

export const pokemons: Record<string, Pokemon> = {};

export const abilities: Record<string, Ability[]> = {};

export const pokemonNames: string[] = [];

export const pokedex = new Pokedex();
