import {
  getWrappedPhase,
  WRAPPED_WINDOW_END,
  WRAPPED_WINDOW_START,
  type WrappedPhase,
  type WrappedResponse,
  type WrappedStats,
} from "@pokenerdle/shared/wrapped";
import { getUserFirstGuess, getUserGuessesInWindow } from "../repositories/daily.repository.js";
import { getPokemonTypes, getWrappedPokemonInfo } from "../repositories/pokemon.repository.js";
import { addDaysToIsoDate, singaporeDate } from "../utils/date.js";
import { computeWrappedStats } from "./wrapped.stats.js";

// In production the launch gate applies and the window is fixed. Elsewhere the story is always live
// and the window ends no later than yesterday, so a day still being played never counts.
export const resolveWrappedWindow = (
  todaySgt: string,
  isProduction: boolean,
): { phase: WrappedPhase; windowEnd: string } => {
  if (isProduction) return { phase: getWrappedPhase(todaySgt), windowEnd: WRAPPED_WINDOW_END };
  const yesterday = addDaysToIsoDate(todaySgt, -1);
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
  const typesById = await getPokemonTypes([...new Set(rows.map((row) => row.pokemonId))]);
  const { daysPlayed, eligible, stats } = computeWrappedStats(
    rows,
    (pokemonId) => typesById.get(pokemonId) ?? [],
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
    }
  }

  const info = await getWrappedPokemonInfo(referenced);
  for (const id of referenced) {
    const pokemon = info.get(id);
    if (pokemon) response.pokemon[id] = pokemon;
  }
  return response;
};
