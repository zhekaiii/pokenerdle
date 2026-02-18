import { ClientToServerEvents, ServerToClientEvents } from "@pokenerdle/shared";
import { Server, Socket } from "socket.io";
import {
  pokemon_v2_pokemon,
  pokemon_v2_pokemonspecies,
  pokemon_v2_pokemontype,
} from "../generated/prisma-sqlite/client.js";

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
    pokemon_v2_versiongroup: {
      generation_id: number | null;
    } | null;
  }[];
};

export type Comp = ">" | "<" | "=";
