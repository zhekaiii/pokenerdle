import { PokemonNamesResponse, PokemonWithAbilities } from "@pokenerdle/shared";
import { pokemon_v2_ability, pokemon_v2_pokemon } from "@prisma/client";
import { readFileSync, writeFileSync } from "fs";
import { Heap } from "heap-js";
import { MIN_PATHFINDER_LENGTH } from "../constants/game.js";
import { Graph } from "../lib/graph.js";
import { prisma } from "../lib/prisma.js";
import { randomChoice, randomChoiceWeighted } from "../utils/random.js";
import { DailyPokemon, isTruthy } from "../utils/types.js";

export const getPokemonNames = async () => {
  const pokemonDetails: PokemonNamesResponse[] = await prisma.$queryRaw`
    SELECT
      p.id,
      CASE
        WHEN COUNT(p.id) > 1
        OR COUNT(fn.id) = 0 THEN psn.name
        ELSE fn.pokemon_name
      END AS name,
      psn.name AS speciesName
    FROM
      pokemon_v2_pokemonform f
      INNER JOIN pokemon_v2_pokemon p ON p.id = f.pokemon_id
      LEFT JOIN pokemon_v2_pokemonformname fn ON f.id = fn.pokemon_form_id
      AND fn.language_id = 9
      INNER JOIN pokemon_v2_pokemonspecies ps ON ps.id = p.pokemon_species_id
      INNER JOIN pokemon_v2_pokemonspeciesname psn ON psn.pokemon_species_id = ps.id
    WHERE
      psn.language_id = 9
    GROUP BY
      p.id;
  `;
  return pokemonDetails;
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
  }
>(
  _pokemon: T
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
  const sprites = await prisma.pokemon_v2_pokemonsprites.findMany();
  return Object.fromEntries(
    sprites.map(({ pokemon_id, sprites }) => [
      pokemon_id,
      JSON.parse(sprites).versions["generation-viii"].icons.front_default,
    ])
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
    current.length > largest.length ? current : largest
  );
  writeFileSync("./component.json", JSON.stringify(component));
  return component;
};

export const getRandomPokemonPath = () => {
  const component: number[] = JSON.parse(
    readFileSync("./component.json", "utf-8")
  );
  const graph = Graph.loadFromJsonString(readFileSync("./graph.json", "utf-8"));
  const paths: Record<number, number[][]> = {};

  const startingNode = randomChoice(component);

  const visited = new Set<number>();
  const queue = new Heap<[node: number, distance: number, path: number[]]>(
    (a, b) => a[1] - b[1]
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
      .flat()
  );
};

export const getNumPokemon = async () => {
  return await prisma.pokemon_v2_pokemon.count();
};

type GetPokemonParams =
  | {
      id: number;
    }
  | {
      offset: number;
    };

export const getPokemonForDaily = async (
  props: GetPokemonParams
): Promise<DailyPokemon | null> => {
  let pokemonId: number;
  if ("offset" in props) {
    const result: [{ id: number }] | [] =
      await prisma.$queryRaw`SELECT id FROM pokemon_v2_pokemon LIMIT 1 OFFSET ${props.offset}`;
    if (result.length == 0) {
      throw new Error("No Pokemon found");
    }
    pokemonId = result[0].id;
  } else {
    pokemonId = props.id;
  }
  return await prisma.pokemon_v2_pokemon.findUnique({
    where: { id: pokemonId, is_default: true },
    include: {
      pokemon_v2_pokemonspecies: true,
      pokemon_v2_pokemontype: true,
      pokemon_v2_pokemonform: {
        select: {
          pokemon_v2_pokemonformgeneration: {
            select: {
              generation_id: true,
            },
            orderBy: {
              generation_id: "asc",
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
  defendingType: number
) => {
  const result = await prisma.pokemon_v2_typeefficacy.findFirstOrThrow({
    where: {
      damage_type_id: attackType,
      target_type_id: defendingType,
    },
  });
  return result.damage_factor / 100;
};
