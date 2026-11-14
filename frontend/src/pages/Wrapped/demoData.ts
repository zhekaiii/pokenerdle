import type { WrappedFinish, WrappedResponse } from "@pokenerdle/shared/wrapped";

// Made-up players for trying the story in development: ?demo=1 for the full story,
// ?demo=simple for the simplified one. ?demo=1&finish=standard|foil|gold|rainbow shows
// that card finish. No local player is eligible, so this is the only
// way to see it. Only reachable behind import.meta.env.DEV (see index.tsx).

const artwork = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

const mon = (
  id: number,
  en: string,
  hans: string,
  hant: string,
  types: string[],
) => ({
  names: { en, "zh-Hans": hans, "zh-Hant": hant },
  artwork: artwork(id),
  types,
});

const pokemon: WrappedResponse["pokemon"] = {
  6: mon(6, "Charizard", "喷火龙", "噴火龍", ["fire", "flying"]),
  25: mon(25, "Pikachu", "皮卡丘", "皮卡丘", ["electric"]),
  94: mon(94, "Gengar", "耿鬼", "耿鬼", ["ghost", "poison"]),
  // No artwork on purpose: the thumbnail on the showing-up screen shows the placeholder.
  130: { ...mon(130, "Gyarados", "暴鲤龙", "暴鯉龍", ["water", "flying"]), artwork: null },
  149: mon(149, "Dragonite", "快龙", "快龍", ["dragon", "flying"]),
  248: mon(248, "Tyranitar", "班基拉斯", "班基拉斯", ["rock", "dark"]),
  445: mon(445, "Garchomp", "烈咬陆鲨", "烈咬陸鯊", ["dragon", "ground"]),
  448: mon(448, "Lucario", "路卡利欧", "路卡利歐", ["fighting", "steel"]),
  707: mon(707, "Klefki", "钥圈儿", "鑰圈兒", ["steel", "fairy"]),
};

const full: WrappedResponse = {
  phase: "live",
  eligible: true,
  daysPlayed: 187,
  stats: {
    daysPlayed: 187,
    daysSolved: 171,
    uniquePokemon: 243,
    mostGuessed: [6, 94, 25, 130, 248, 149],
    streak: { length: 23, start: "2026-03-04", end: "2026-03-26" },
    opener: { pokemonId: 445, days: 64 },
    topTypes: [
      { type: "dragon", share: 0.21 },
      { type: "water", share: 0.16 },
      { type: "steel", share: 0.12 },
    ],
    clock: {
      fastest: { ms: 38_000, date: "2026-05-12", pokemonId: 448 },
      longest: { ms: 9 * 60_000, date: "2026-08-14", pokemonId: 707 },
    },
    average: 3.9,
    finish: "gold",
  },
  simple: null,
  pokemon,
};

// A December newcomer: nothing in the January to November window.
const simple: WrappedResponse = {
  phase: "live",
  eligible: false,
  daysPlayed: 0,
  stats: null,
  simple: { pokemonId: 445, date: "2026-12-03" },
  pokemon,
};

// An average that earns each finish, so the story and the card agree with ?finish=.
const FINISH_AVERAGE: Record<WrappedFinish, number> = {
  standard: 4.8,
  foil: 4.4,
  gold: 3.9,
  rainbow: 3.4,
};

const isFinish = (value: string | null): value is WrappedFinish =>
  value !== null && value in FINISH_AVERAGE;

// `search` is the location's query string, with or without the leading "?".
export const getDemoResponse = (search: string): WrappedResponse | null => {
  const params = new URLSearchParams(search);
  const demo = params.get("demo");
  if (demo === "simple") return simple;
  if (demo !== "1") return null;
  const finish = params.get("finish");
  if (!isFinish(finish) || !full.stats) return full;
  return {
    ...full,
    stats: { ...full.stats, finish, average: FINISH_AVERAGE[finish] },
  };
};
