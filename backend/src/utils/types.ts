import { ClientToServerEvents, ServerToClientEvents } from "@pokenerdle/shared";
import {
  pokemon_v2_pokemon,
  pokemon_v2_pokemonspecies,
  pokemon_v2_pokemontype,
} from "@prisma/client";
import { Server, Socket } from "socket.io";

export const isTruthy = <T>(value: T | null | undefined): value is T =>
  Boolean(value);

export type PokeNerdleServer = Server<
  ClientToServerEvents,
  ServerToClientEvents
>;

export type PokeNerdleSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents
>;

export type DailyPokemon = pokemon_v2_pokemon & {
  pokemon_v2_pokemonspecies: pokemon_v2_pokemonspecies | null;
  pokemon_v2_pokemontype: pokemon_v2_pokemontype[];
  pokemon_v2_pokemonform: {
    pokemon_v2_pokemonformgeneration: {
      generation_id: number | null;
    }[];
  }[];
};

export type Comp = ">" | "<" | "=";
