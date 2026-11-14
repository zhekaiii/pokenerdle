import {
  getWrappedPhase,
  WRAPPED_WINDOW_END,
  WRAPPED_WINDOW_START,
  type WrappedPhase,
  type WrappedPokemonInfo,
  type WrappedResponse,
  type WrappedStats,
} from "@pokenerdle/shared/wrapped";
import { subDays } from "date-fns";
import { getUserFirstGuess, getUserGuessesInWindow } from "../repositories/daily.repository.js";
import { getWrappedPokemonInfo } from "../repositories/pokemon.repository.js";
import { computeWrappedStats, singaporeDate } from "./wrapped.stats.js";

type PokemonInfo = WrappedPokemonInfo & { types: string[] };

// In production the launch gate applies and the window is fixed. Elsewhere the story is always live
// and the window ends no later than yesterday, so a day still being played never counts.
export const resolveWrappedWindow = (
  todaySgt: string,
  isProduction: boolean,
): { phase: WrappedPhase; windowEnd: string } => {
  if (isProduction) return { phase: getWrappedPhase(todaySgt), windowEnd: WRAPPED_WINDOW_END };
  // Noon UTC keeps the calendar date stable whatever the server's time zone.
  const yesterday = subDays(new Date(`${todaySgt}T12:00:00Z`), 1).toISOString().slice(0, 10);
  return { phase: "live", windowEnd: yesterday < WRAPPED_WINDOW_END ? yesterday : WRAPPED_WINDOW_END };
};

const referencedPokemonIds = (stats: WrappedStats): number[] => [
  ...new Set([
    stats.opener.pokemonId,
    ...stats.mostGuessed,
    ...(stats.clock ? [stats.clock.fastest.pokemonId] : []),
    ...(stats.clock?.longest ? [stats.clock.longest.pokemonId] : []),
  ]),
];

export const getWrappedService = async (userId: string): Promise<WrappedResponse> => {
  const { phase, windowEnd } = resolveWrappedWindow(
    singaporeDate(new Date()),
    process.env.NODE_ENV === "production",
  );
  const response: WrappedResponse = { phase, eligible: false, daysPlayed: 0, stats: null, simple: null, pokemon: {} };
  if (phase !== "live") return response;

  const rows = await getUserGuessesInWindow(userId, WRAPPED_WINDOW_START, windowEnd);
  const info = await getWrappedPokemonInfo([...new Set(rows.map((row) => row.pokemonId))]);
  const { daysPlayed, eligible, stats } = computeWrappedStats(
    rows,
    (pokemonId) => info.get(pokemonId)?.types ?? [],
    windowEnd,
  );
  response.daysPlayed = daysPlayed;
  response.eligible = eligible;

  const referenced: number[] = [];
  if (stats) {
    response.stats = stats;
    referenced.push(...referencedPokemonIds(stats));
  } else {
    const first = await getUserFirstGuess(userId);
    if (first) {
      response.simple = { pokemonId: first.pokemonId, date: singaporeDate(first.createdAt) };
      referenced.push(first.pokemonId);
      // The first guess can predate the window or be an archive play, so it may not be loaded yet.
      if (!info.has(first.pokemonId)) {
        for (const [id, loaded] of await getWrappedPokemonInfo([first.pokemonId])) info.set(id, loaded);
      }
    }
  }

  for (const id of referenced) {
    const pokemonInfo: PokemonInfo | undefined = info.get(id);
    if (pokemonInfo) response.pokemon[id] = pokemonInfo;
  }
  return response;
};
