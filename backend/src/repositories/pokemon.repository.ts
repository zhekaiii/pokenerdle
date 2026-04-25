import {
  PokemonNamesResponse,
  PokemonWithAbilities,
  StatGuessScope,
  StatGuessStats,
} from "@pokenerdle/shared";
import { readFileSync, writeFileSync } from "fs";
import { Heap } from "heap-js";
import {
  DAILY_WHITELISTED_POKEMON_WHERE,
  ICON_SUFFIXES,
  MIN_PATHFINDER_LENGTH,
  STAT_ID,
} from "../constants/game.js";
import {
  Prisma,
  pokemon_v2_ability,
  pokemon_v2_pokemon,
} from "../generated/prisma-sqlite/client.js";
import { LanguageId } from "../lib/constants.js";
import { Graph } from "../lib/graph.js";
import { prisma } from "../lib/prisma.js";
import { randomChoice, randomChoiceWeighted } from "../utils/random.js";
import { DailyPokemon, isTruthy } from "../utils/types.js";

export const getPokemonNames = async (lang: LanguageId) => {
  const pokemonDetails: PokemonNamesResponse[] = await prisma.$queryRaw`
    SELECT
      p.id,
      CASE
        WHEN COUNT(p.id) > 1
        OR COUNT(fn.id) = 0 THEN psn.name
        WHEN fn.pokemon_name != '' THEN fn.pokemon_name
        WHEN fn.name != '' AND fn.name != psn.name THEN psn.name || ' (' || fn.name || ')'
        ELSE ''
      END AS name,
      psn.name AS speciesName
    FROM
      pokemon_v2_pokemonform f
      INNER JOIN pokemon_v2_pokemon p ON p.id = f.pokemon_id
      LEFT JOIN pokemon_v2_pokemonformname fn ON f.id = fn.pokemon_form_id
      AND fn.language_id = ${lang}
      INNER JOIN pokemon_v2_pokemonspecies ps ON ps.id = p.pokemon_species_id
      INNER JOIN pokemon_v2_pokemonspeciesname psn ON psn.pokemon_species_id = ps.id
    WHERE
      psn.language_id = ${lang}
      AND f.is_default = true
    GROUP BY
      p.id;
  `;
  return pokemonDetails;
};

export const getPokemonIdsByGeneration = async (
  generation: number,
): Promise<number[]> => {
  const result = await prisma.pokemon_v2_pokemon.findMany({
    where: {
      pokemon_v2_pokemonform: {
        some: {
          is_default: true,
          pokemon_v2_versiongroup: {
            generation_id: generation,
          },
        },
      },
    },
    select: {
      id: true,
    },
    orderBy: {
      id: "asc",
    },
  });
  return result.map((pokemon) => pokemon.id);
};

export const getRandomPokemonIdWithMultipleAbilities = async () => {
  const result: [{ pokemon_id: number }] | [] =
    await prisma.$queryRaw`SELECT pokemon_id FROM pokemon_v2_pokemonability GROUP BY pokemon_id HAVING COUNT(DISTINCT ability_id) > 1 ORDER BY RANDOM() LIMIT 1;`;
  if (result.length == 0) {
    throw new Error("No starter Pokemon found");
  }
  return result[0].pokemon_id;
};

export const prettifyQueriedPokemon = <
  T extends pokemon_v2_pokemon & {
    pokemon_v2_pokemonability: {
      pokemon_v2_ability: pokemon_v2_ability | null;
    }[];
    pokemon_v2_pokemonspecies: { name: string } | null;
    pokemon_v2_pokemonsprites: { sprites: string }[];
  },
>(
  _pokemon: T,
): PokemonWithAbilities => {
  const {
    pokemon_v2_pokemonability,
    pokemon_v2_pokemonspecies,
    pokemon_v2_pokemonsprites,
    ...pokemon
  } = _pokemon;
  return {
    ...pokemon,
    abilities: pokemon_v2_pokemonability
      .map(({ pokemon_v2_ability }) => pokemon_v2_ability)
      .filter(isTruthy),
    speciesName: pokemon_v2_pokemonspecies!.name,
    sprites: JSON.parse(pokemon_v2_pokemonsprites[0]?.sprites ?? "{}"),
  };
};

export const getPokemonWithAbilities = async (id: number) => {
  const pokemon = await prisma.pokemon_v2_pokemon.findUnique({
    where: { id },
    include: {
      pokemon_v2_pokemonability: {
        select: { pokemon_v2_ability: true },
      },
      pokemon_v2_pokemonspecies: {
        select: {
          name: true,
        },
      },
      pokemon_v2_pokemonsprites: {
        select: {
          sprites: true,
        },
      },
    },
  });
  return pokemon && prettifyQueriedPokemon(pokemon);
};

export const getPokemonIcons = async (): Promise<Record<number, string>> => {
  const sprites = await prisma.pokemon_v2_pokemonsprites.findMany({
    select: {
      pokemon_id: true,
      sprites: true,
      pokemon_v2_pokemon: {
        select: {
          pokemon_species_id: true,
          name: true,
        },
      },
    },
  });
  return Object.fromEntries(
    sprites.map(({ pokemon_id, sprites, pokemon_v2_pokemon }) => {
      const speciesId = pokemon_v2_pokemon?.pokemon_species_id
        ?.toString()
        .padStart(3, "0");
      const name = pokemon_v2_pokemon?.name;

      const suffix = ICON_SUFFIXES.find((region) =>
        name?.toLowerCase().includes(region),
      );

      const filename = `${speciesId}${suffix ? `-${suffix}` : ""}.png`;

      const fallbackUrl = `https://raw.githubusercontent.com/pokedextracker/pokesprite/refs/heads/master/images/${filename}`;

      const parsedSprites = JSON.parse(sprites);
      return [
        pokemon_id,
        parsedSprites.versions["generation-viii"].icons.front_default ??
          parsedSprites.versions["generation-vii"].icons.front_default ??
          fallbackUrl,
      ];
    }),
  );
};

/**
 * Generates a graph where each Pokemon is a node and there is an edge between
 * Pokemon that share an ability.
 *
 * @returns The generated graph.
 */
export const generatePokemonGraph = async () => {
  const graph = new Graph();
  const pokemonIds = await prisma.pokemon_v2_pokemon.findMany({
    select: {
      id: true,
      pokemon_v2_pokemonability: {
        select: {
          ability_id: true,
        },
      },
    },
  });
  const pokemonByAbilities: Record<number, number[]> = {};
  for (const { id, pokemon_v2_pokemonability } of pokemonIds) {
    graph.addVertex(id);
    for (const { ability_id } of pokemon_v2_pokemonability) {
      if (ability_id) {
        if (!pokemonByAbilities[ability_id]) {
          pokemonByAbilities[ability_id] = [];
        }
        pokemonByAbilities[ability_id].push(id);
      }
    }
  }
  for (const pokemonIds of Object.values(pokemonByAbilities)) {
    for (let i = 0; i < pokemonIds.length - 1; i++) {
      for (let j = i + 1; j < pokemonIds.length; j++) {
        graph.addEdge(pokemonIds[i], pokemonIds[j]);
      }
    }
  }
  writeFileSync("./graph.json", graph.jsonify());
  return graph;
};

export const findLargestConnectedComponent = () => {
  const graph = Graph.loadFromJsonString(readFileSync("./graph.json", "utf-8"));
  const components = graph.findConnectedComponents();
  const component = components.reduce((largest, current) =>
    current.length > largest.length ? current : largest,
  );
  writeFileSync("./component.json", JSON.stringify(component));
  return component;
};

export const getRandomPokemonPath = () => {
  const component: number[] = JSON.parse(
    readFileSync("./component.json", "utf-8"),
  );
  const graph = Graph.loadFromJsonString(readFileSync("./graph.json", "utf-8"));
  const paths: Record<number, number[][]> = {};

  const startingNode = randomChoice(component);

  const visited = new Set<number>();
  const queue = new Heap<[node: number, distance: number, path: number[]]>(
    (a, b) => a[1] - b[1],
  );
  queue.init([[startingNode, 1, [startingNode]]]);

  while (queue.length) {
    const [node, distance, path] = queue.pop()!;
    if (visited.has(node)) {
      continue;
    }
    if (distance >= MIN_PATHFINDER_LENGTH) {
      paths[distance] = (paths[distance] || []).concat([path]);
    }
    visited.add(node);
    for (const neighbor of graph.adjacencyList[node]) {
      if (!visited.has(neighbor)) {
        queue.push([neighbor, distance + 1, path.concat(neighbor)]);
      }
    }
  }
  return randomChoiceWeighted(
    Object.values(paths).flat(),
    Object.entries(paths)
      .map(([length]) => (+length - (MIN_PATHFINDER_LENGTH - 1)) ** 2)
      .flat(),
  );
};

export const getNumDefaultPokemon = async () => {
  return await prisma.pokemon_v2_pokemon.count(DAILY_WHITELISTED_POKEMON_WHERE);
};

type GetPokemonParams =
  | {
      id: number;
    }
  | {
      offset: number;
    };

export const getPokemonForDaily = async (
  props: GetPokemonParams,
): Promise<DailyPokemon | null> => {
  let pokemonId: number;
  if ("offset" in props) {
    const result = await prisma.pokemon_v2_pokemon.findFirst({
      ...DAILY_WHITELISTED_POKEMON_WHERE,
      skip: props.offset,
      select: {
        id: true,
      },
    });
    if (!result) {
      throw new Error("No Pokemon found");
    }
    pokemonId = result.id;
  } else {
    pokemonId = props.id;
  }
  return await prisma.pokemon_v2_pokemon.findUnique({
    where: {
      id: pokemonId,
    },
    include: {
      pokemon_v2_pokemonspecies: true,
      pokemon_v2_pokemontype: {
        orderBy: {
          slot: "asc",
        },
      },
      pokemon_v2_pokemonform: {
        select: {
          pokemon_v2_versiongroup: {
            select: {
              generation_id: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Gets the damage factor (multiplier) when a Pokemon of attackType attacks a Pokemon of defendingType
 * @returns 0, 0.5, 1 or 2
 */
export const getDamageFactor = async (
  attackType: number,
  defendingType: number,
) => {
  const result = await prisma.pokemon_v2_typeefficacy.findFirstOrThrow({
    where: {
      damage_type_id: attackType,
      target_type_id: defendingType,
    },
  });
  return result.damage_factor / 100;
};

const buildScopeWhere = (
  scope: StatGuessScope,
): Prisma.pokemon_v2_pokemonWhereInput => {
  switch (scope.kind) {
    case "all":
      return {};
    case "format":
      return {
        metagame_format_pokemon: {
          some: { format_id: scope.formatId },
        },
      };
    case "generations":
      // Filter by the version group that introduced each form (matching
      // `getPokemonIdsByGeneration` used elsewhere in the app), so that e.g.
      // Mega Charizard X — a Gen 6 form of a Gen 1 species — is returned
      // when the player selects Gen 6, not Gen 1.
      return {
        pokemon_v2_pokemonform: {
          some: {
            pokemon_v2_versiongroup: {
              generation_id: { in: scope.generations },
            },
          },
        },
      };
  }
};

export type RandomPokemonWithStats = {
  pokemonId: number;
  stats: StatGuessStats;
};

/**
 * Returns one random Pokémon (matching scope + exclusions) with its 6 base
 * stats, or null if the scoped pool is empty. The service handles the
 * exclude-list fallback before deciding whether to surface a 404.
 */
export const getRandomPokemonWithStats = async ({
  scope,
  excludeIds,
}: {
  scope: StatGuessScope;
  excludeIds?: number[];
}): Promise<RandomPokemonWithStats | null> => {
  const where: Prisma.pokemon_v2_pokemonWhereInput = {
    AND: [
      buildScopeWhere(scope),
      ...(excludeIds && excludeIds.length > 0
        ? [{ id: { notIn: excludeIds } }]
        : []),
    ],
  };

  const count = await prisma.pokemon_v2_pokemon.count({ where });
  if (count === 0) return null;

  const offset = Math.floor(Math.random() * count);
  const result = await prisma.pokemon_v2_pokemon.findFirst({
    where,
    skip: offset,
    select: {
      id: true,
      pokemon_v2_pokemonstat: {
        select: { stat_id: true, base_stat: true },
      },
    },
  });
  if (!result) return null;

  const byStatId = new Map(
    result.pokemon_v2_pokemonstat.map((s) => [s.stat_id, s.base_stat]),
  );
  return {
    pokemonId: result.id,
    stats: {
      hp: byStatId.get(STAT_ID.hp) ?? 0,
      attack: byStatId.get(STAT_ID.attack) ?? 0,
      defense: byStatId.get(STAT_ID.defense) ?? 0,
      specialAttack: byStatId.get(STAT_ID.specialAttack) ?? 0,
      specialDefense: byStatId.get(STAT_ID.specialDefense) ?? 0,
      speed: byStatId.get(STAT_ID.speed) ?? 0,
    },
  };
};

export const getMetagameFormats = async () => {
  const rows = await prisma.metagame_format.findMany({
    select: {
      id: true,
      display_name: true,
      _count: { select: { metagame_format_pokemon: true } },
    },
    orderBy: { id: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    displayName: r.display_name,
    pokemonCount: r._count.metagame_format_pokemon,
  }));
};
