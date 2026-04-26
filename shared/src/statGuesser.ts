import * as z from "zod";

export type StatGuessStats = {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
};

export const STAT_KEYS = [
  "hp",
  "attack",
  "defense",
  "specialAttack",
  "specialDefense",
  "speed",
] as const;

export type StatKey = (typeof STAT_KEYS)[number];

export const SLIDER_MIN = 1;
export const SLIDER_MAX = 255;
export const SLIDER_DEFAULT = 100;

// Mirrors PokemonDB's `barchart-rank-N` stat coloring:
// rank 1: 1–29, rank 2: 30–59, rank 3: 60–89, rank 4: 90–119,
// rank 5: 120–149, rank 6: 150+.
export const STAT_RANK_COLORS = [
  "#f34444",
  "#ff7f0f",
  "#ffdd57",
  "#a0e515",
  "#23cd5e",
  "#00c2b8",
] as const;

export const statRankColor = (value: number): string => {
  const rank = Math.min(6, Math.max(1, Math.floor(value / 30) + 1));
  return STAT_RANK_COLORS[rank - 1];
};

// Scope is the discriminated union enforcing mutual exclusion between
// "filter by generations" and "filter by format" at the type level.
export const StatGuessScopeSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("all") }),
  z.object({ kind: z.literal("format"), formatId: z.string().min(1) }),
  z.object({
    kind: z.literal("generations"),
    generations: z.array(z.number().int().min(1)).min(1),
  }),
]);

export type StatGuessScope = z.infer<typeof StatGuessScopeSchema>;

// `StatGuessFilter` is currently identical to `StatGuessScope`.
// Kept as a separate alias so future UI-only filter state (e.g. exclude
// previously-seen Pokémon) can be added without changing the API scope shape.
export const StatGuessFilterSchema = StatGuessScopeSchema;
export type StatGuessFilter = StatGuessScope;

// ───── /v1/stat-guess/formats ─────

export type StatGuessFormat = {
  id: string;
  displayName: string;
  pokemonCount: number;
};

export type StatGuessFormatsResponse = {
  formats: StatGuessFormat[];
};

// ───── /v1/stat-guess/round ─────

const csvNumberList = z
  .string()
  .regex(/^\d+(,\d+)*$/, "must be a comma-separated list of integers")
  .transform((s) => s.split(",").map(Number));

export const StatGuessRoundQuerySchema = z
  .object({
    format: z.string().min(1).optional(),
    gen: csvNumberList.optional(),
    excludeIds: csvNumberList.optional(),
  })
  .refine((q) => !(q.format && q.gen), {
    message: "format and gen are mutually exclusive",
    path: ["format"],
  });

export type StatGuessRoundQuery = z.infer<typeof StatGuessRoundQuerySchema>;

export type StatGuessRoundResponse = {
  pokemonId: number;
  stats: StatGuessStats;
};

// ───── helpers ─────

export const filterToQueryString = (filter: StatGuessFilter): string => {
  const params = new URLSearchParams();
  if (filter.kind === "format") {
    params.set("format", filter.formatId);
  } else if (filter.kind === "generations") {
    params.set("gen", filter.generations.join(","));
  }
  return params.toString();
};
