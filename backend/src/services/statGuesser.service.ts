import {
  StatGuessFormatsResponse,
  StatGuessRoundResponse,
  StatGuessScope,
} from "@pokenerdle/shared";
import {
  getMetagameFormats,
  getRandomPokemonWithStats,
} from "../repositories/pokemon.repository.js";

export class NoMatchingPokemonError extends Error {
  constructor() {
    super("no_pokemon_match_filter");
    this.name = "NoMatchingPokemonError";
  }
}

export class InvalidFormatError extends Error {
  constructor(formatId: string) {
    super(`invalid_format: ${formatId}`);
    this.name = "InvalidFormatError";
  }
}

export const getFormats = async (): Promise<StatGuessFormatsResponse> => {
  const formats = await getMetagameFormats();
  return { formats };
};

/**
 * Picks one random Pokémon for the given scope.
 * Retries once with `excludeIds = []` if the with-exclusions query is empty,
 * so a tiny pool (e.g. 3 Pokémon all in the exclude list) doesn't 404.
 */
export const getRound = async ({
  scope,
  excludeIds,
}: {
  scope: StatGuessScope;
  excludeIds: number[];
}): Promise<StatGuessRoundResponse> => {
  if (scope.kind === "format") {
    const formats = await getMetagameFormats();
    if (!formats.some((f) => f.id === scope.formatId)) {
      throw new InvalidFormatError(scope.formatId);
    }
  }

  let result = await getRandomPokemonWithStats({ scope, excludeIds });
  if (result === null && excludeIds.length > 0) {
    result = await getRandomPokemonWithStats({ scope, excludeIds: [] });
  }
  if (result === null) {
    throw new NoMatchingPokemonError();
  }
  return result;
};
