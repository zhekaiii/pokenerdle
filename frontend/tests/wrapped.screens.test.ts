import { afterEach, describe, expect, test } from "bun:test";
import type { WrappedResponse, WrappedStats } from "@pokenerdle/shared/wrapped";
import {
  ART_REFERENCE,
  fitArtwork,
  measureArtwork,
} from "../src/pages/Wrapped/cardArt";
import { TYPE_COLORS, typeColors, typeColorVars } from "../src/pages/Wrapped/cardColors";
import { pokemonInfo } from "../src/pages/Wrapped/format";
import {
  buildScreens,
  finishesUpTo,
  pickCardRows,
  SIMPLE_SCREENS,
} from "../src/pages/Wrapped/screens";
import { canShareFiles, shareImage, unicodeRangeCovers } from "../src/pages/Wrapped/shareImage";
import { getTargetIndex, TRANSITION } from "../src/pages/Wrapped/transition";

const solve = { ms: 38_000, date: "2026-05-12", pokemonId: 448 };

const stats = (overrides: Partial<WrappedStats> = {}): WrappedStats => ({
  daysPlayed: 187,
  daysSolved: 171,
  uniquePokemon: 243,
  mostGuessed: [6, 94, 25, 130, 248, 149],
  streak: { length: 23, start: "2026-03-04", end: "2026-03-26" },
  opener: { pokemonId: 445, days: 64 },
  topTypes: [{ type: "dragon", share: 0.21 }],
  clock: { fastest: solve, longest: null },
  average: 3.9,
  finish: "gold",
  ...overrides,
});

describe("buildScreens", () => {
  test("a full year has all nine screens in order", () => {
    expect(buildScreens(stats())).toEqual([
      "opener",
      "showingUp",
      "streak",
      "signature",
      "types",
      "clock",
      "average",
      "thanks",
      "card",
    ]);
  });

  test("thanks is always directly before card", () => {
    const bare = buildScreens(stats({ streak: null, clock: null, average: null }));
    expect(bare.slice(-2)).toEqual(["thanks", "card"]);
    expect(buildScreens(stats()).slice(-2)).toEqual(["thanks", "card"]);
  });

  test("the full story never contains firstGuess", () => {
    expect(buildScreens(stats())).not.toContain("firstGuess");
    expect(
      buildScreens(stats({ streak: null, clock: null, average: null })),
    ).not.toContain("firstGuess");
  });

  test("streak is skipped when stats.streak is null", () => {
    expect(buildScreens(stats({ streak: null }))).not.toContain("streak");
  });

  test("clock is skipped when stats.clock is null", () => {
    expect(buildScreens(stats({ clock: null }))).not.toContain("clock");
  });

  test("average is skipped when the average is null or above 4.5", () => {
    expect(buildScreens(stats({ average: null }))).not.toContain("average");
    expect(buildScreens(stats({ average: 4.6 }))).not.toContain("average");
    expect(buildScreens(stats({ average: 4.5 }))).toContain("average");
  });

  test("opener, showingUp, signature, types, thanks and card are always present", () => {
    const bare = buildScreens(stats({ streak: null, clock: null, average: null }));
    expect(bare).toEqual([
      "opener",
      "showingUp",
      "signature",
      "types",
      "thanks",
      "card",
    ]);
  });
});

describe("SIMPLE_SCREENS", () => {
  test("is the four-screen story with the first guess before the thank-you", () => {
    expect(SIMPLE_SCREENS).toEqual(["opener", "firstGuess", "thanks", "card"]);
  });
});

describe("getTargetIndex", () => {
  test("a normal step moves one screen either way", () => {
    expect(getTargetIndex(3, 9, 1, false)).toBe(4);
    expect(getTargetIndex(3, 9, -1, false)).toBe(2);
  });

  test("back from the first screen does nothing", () => {
    expect(getTargetIndex(0, 9, -1, false)).toBeNull();
  });

  test("forward from the last screen does nothing", () => {
    expect(getTargetIndex(8, 9, 1, false)).toBeNull();
    expect(getTargetIndex(3, 4, 1, false)).toBeNull();
  });

  test("a step while a change is playing is rejected", () => {
    expect(getTargetIndex(3, 9, 1, true)).toBeNull();
    expect(getTargetIndex(3, 9, -1, true)).toBeNull();
  });

  test("the ends are still reachable from the screen next to them", () => {
    expect(getTargetIndex(1, 9, -1, false)).toBe(0);
    expect(getTargetIndex(7, 9, 1, false)).toBe(8);
  });
});

describe("TRANSITION", () => {
  test("input unlocks only after the flood and its black edge are done", () => {
    expect(TRANSITION.floodDoneMs).toBeGreaterThanOrEqual(
      TRANSITION.floodLeadMs + TRANSITION.floodMs,
    );
    expect(TRANSITION.busyMs).toBeGreaterThanOrEqual(TRANSITION.floodDoneMs);
  });

  test("the new screen has finished arriving before input unlocks", () => {
    expect(TRANSITION.enterAtMs + TRANSITION.enterMs).toBeLessThanOrEqual(
      TRANSITION.busyMs,
    );
  });
});

describe("pickCardRows", () => {
  test("a full year shows streak, type and average", () => {
    expect(pickCardRows(stats())).toEqual([
      { kind: "streak", days: 23 },
      { kind: "type", type: "dragon" },
      { kind: "average", value: 3.9 },
    ]);
  });

  test("without a streak it shows type, average, unique", () => {
    expect(pickCardRows(stats({ streak: null }))).toEqual([
      { kind: "type", type: "dragon" },
      { kind: "average", value: 3.9 },
      { kind: "unique", count: 243 },
    ]);
  });

  test("an average above 4.5 or null is replaced by unique", () => {
    const expected = [
      { kind: "streak", days: 23 },
      { kind: "type", type: "dragon" },
      { kind: "unique", count: 243 },
    ];
    expect(pickCardRows(stats({ average: 4.6 }))).toEqual(expected);
    expect(pickCardRows(stats({ average: null }))).toEqual(expected);
    expect(pickCardRows(stats({ average: 4.5 }))[2]).toEqual({
      kind: "average",
      value: 4.5,
    });
  });

  test("only two rows when nothing else is available", () => {
    expect(
      pickCardRows(stats({ streak: null, average: null, daysSolved: 0 })),
    ).toEqual([
      { kind: "type", type: "dragon" },
      { kind: "unique", count: 243 },
    ]);
  });

  test("solved days is the last fallback and needs at least 1", () => {
    const bare = { streak: null, average: null, uniquePokemon: 0 };
    expect(pickCardRows(stats({ ...bare, daysSolved: 12 }))).toEqual([
      { kind: "type", type: "dragon" },
      { kind: "solved", days: 12 },
    ]);
    expect(pickCardRows(stats({ ...bare, daysSolved: 0 }))).toEqual([
      { kind: "type", type: "dragon" },
    ]);
  });

  test("a streak under the minimum is not shown", () => {
    expect(pickCardRows(stats({ streak: { length: 2, start: "2026-03-04", end: "2026-03-05" } }))[0])
      .toEqual({ kind: "type", type: "dragon" });
  });

  test("a player with no top type still gets rows", () => {
    expect(pickCardRows(stats({ topTypes: [] })).map((row) => row.kind)).toEqual([
      "streak",
      "average",
      "unique",
    ]);
  });
});

describe("a card whose artwork is missing", () => {
  const response: WrappedResponse = {
    phase: "live",
    eligible: true,
    daysPlayed: 187,
    stats: stats(),
    simple: null,
    pokemon: {
      445: {
        names: { en: "Garchomp", "zh-Hans": "烈咬陆鲨", "zh-Hant": "烈咬陸鯊" },
        artwork: null,
        types: ["dragon", "ground"],
      },
    },
  };

  test("still yields a renderable card", () => {
    expect(() => pickCardRows(response.stats as WrappedStats)).not.toThrow();
    // The card reads its name and art through pokemonInfo; a null artwork is what
    // makes Artwork show the question-mark placeholder.
    expect(pokemonInfo(response, 445, "en")).toEqual({
      name: "Garchomp",
      artwork: null,
    });
  });

  test("a Pokemon missing from the response falls back to its number", () => {
    expect(pokemonInfo(response, 9999, "en")).toEqual({
      name: "#9999",
      artwork: null,
    });
  });
});

describe("TYPE_COLORS", () => {
  const TYPES = [
    "bug", "dark", "dragon", "electric", "fairy", "fighting", "fire", "flying", "ghost",
    "grass", "ground", "ice", "normal", "poison", "psychic", "rock", "steel", "water",
  ];

  test("covers all 18 types, each with every colour", () => {
    expect(Object.keys(TYPE_COLORS).sort()).toEqual([...TYPES].sort());
    for (const type of TYPES) {
      for (const value of Object.values(TYPE_COLORS[type])) {
        expect(value.length).toBeGreaterThan(0);
      }
    }
  });

  test("no two types share a frame", () => {
    const frames = TYPES.map((type) => TYPE_COLORS[type].frame);
    expect(new Set(frames).size).toBe(TYPES.length);
  });

  test("an unknown type falls back to a defined one", () => {
    expect(typeColors("shadow")).toEqual(TYPE_COLORS.normal);
    expect(typeColors("dragon")).toEqual(TYPE_COLORS.dragon);
  });

  test("a card with no top type still gets a frame, never the gold fallbacks", () => {
    const vars = typeColorVars(undefined) as Record<string, string>;
    expect(vars["--frame"]).toBe(TYPE_COLORS.normal.frame);
    expect(vars["--rim"]).toBe(TYPE_COLORS.normal.rim);
    expect(vars["--stripbg"]).toBe(TYPE_COLORS.normal.strip);
  });
});

// RGBA pixels for a w x h image with an opaque grey block at (x, y, bw, bh).
const image = (
  w: number,
  h: number,
  block: { x: number; y: number; bw: number; bh: number; grey: number },
) => {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let row = block.y; row < block.y + block.bh; row++) {
    for (let col = block.x; col < block.x + block.bw; col++) {
      const i = (row * w + col) * 4;
      data.set([block.grey, block.grey, block.grey, 255], i);
    }
  }
  return data;
};

describe("measureArtwork", () => {
  test("reads how much of the image the drawing fills and how light it is", () => {
    // A 5x5 block in the middle of a 10x10 image covers a quarter of it, so 0.5 a side.
    const m = measureArtwork(image(10, 10, { x: 2, y: 2, bw: 5, bh: 5, grey: 255 }), 10, 10);
    expect(m?.fill).toBeCloseTo(0.5);
    expect(m?.lightness).toBeCloseTo(1);
    const dark = measureArtwork(image(10, 10, { x: 0, y: 0, bw: 10, bh: 10, grey: 0 }), 10, 10);
    expect(dark?.fill).toBeCloseTo(1);
    expect(dark?.lightness).toBeCloseTo(0);
  });

  test("a fully transparent image has nothing to measure", () => {
    expect(measureArtwork(new Uint8ClampedArray(10 * 10 * 4), 10, 10)).toBeNull();
  });
});

describe("fitArtwork", () => {
  test("the reference drawing is left as it is", () => {
    const fit = fitArtwork(ART_REFERENCE);
    expect(fit.scale).toBeCloseTo(1);
    expect(fit.brightness).toBeCloseTo(1);
  });

  test("a drawing that fills less of its image is scaled up, to at most 1.15", () => {
    const fit = fitArtwork({ fill: ART_REFERENCE.fill * 0.9, lightness: ART_REFERENCE.lightness });
    expect(fit.scale).toBeCloseTo(1 / 0.9);
    expect(fitArtwork({ fill: 0.1, lightness: ART_REFERENCE.lightness }).scale).toBe(1.15);
  });

  test("a drawing that fills more is scaled down, to at least 0.6", () => {
    const fit = fitArtwork({ fill: ART_REFERENCE.fill * 1.25, lightness: ART_REFERENCE.lightness });
    expect(fit.scale).toBeCloseTo(0.8);
    expect(fitArtwork({ fill: ART_REFERENCE.fill * 10, lightness: ART_REFERENCE.lightness }).scale).toBe(0.6);
  });

  test("a light drawing gets darker shading and a dark one never goes past the cap", () => {
    // brightness is a multiplier on the owner's 1.75 setting; the product stays in 0.45 to 1.8.
    expect(fitArtwork({ fill: ART_REFERENCE.fill, lightness: ART_REFERENCE.lightness * 1.5 }).brightness)
      .toBeCloseTo(1 / 1.5);
    expect(fitArtwork({ fill: ART_REFERENCE.fill, lightness: 0.01 }).brightness).toBeCloseTo(1.8 / 1.75);
    expect(fitArtwork({ fill: ART_REFERENCE.fill, lightness: 1 }).brightness).toBeCloseTo(
      ART_REFERENCE.lightness,
    );
  });

  test("nothing measured means no adjustment", () => {
    expect(fitArtwork(null)).toEqual({ scale: 1, brightness: 1 });
  });
});

describe("canShareFiles", () => {
  test("is false where the browser has no canShare", () => {
    expect(canShareFiles({})).toBe(false);
    expect(canShareFiles({ canShare: undefined })).toBe(false);
  });

  test("is false when canShare says the files cannot be shared", () => {
    expect(canShareFiles({ canShare: () => false })).toBe(false);
  });

  test("is true when canShare accepts a PNG file, and is asked about files", () => {
    let asked: ShareData | undefined;
    const shareable = canShareFiles({
      canShare: (data) => {
        asked = data;
        return true;
      },
    });
    expect(shareable).toBe(true);
    expect(asked?.files?.[0]?.type).toBe("image/png");
  });

  test("is false when canShare throws", () => {
    expect(
      canShareFiles({
        canShare: () => {
          throw new TypeError("not supported");
        },
      }),
    ).toBe(false);
  });
});

describe("unicodeRangeCovers", () => {
  const LATIN = "U+0000-00FF, U+0131, U+0152-0153";

  test("a face with no range covers everything", () => {
    expect(unicodeRangeCovers("", "烈咬陆鲨")).toBe(true);
  });

  test("covers text with a character in a span or equal to a single code point", () => {
    expect(unicodeRangeCovers(LATIN, "Pokenerdle")).toBe(true);
    expect(unicodeRangeCovers(LATIN, "ı")).toBe(true); // U+0131
    expect(unicodeRangeCovers(LATIN, "œ")).toBe(true); // U+0153
  });

  test("covers mixed text when any one character is in range", () => {
    expect(unicodeRangeCovers("U+4E00-9FFF", "2026 烈咬陆鲨")).toBe(true);
  });

  test("does not cover text with no character in range", () => {
    expect(unicodeRangeCovers("U+4E00-9FFF", "Pokenerdle 2026")).toBe(false);
    expect(unicodeRangeCovers(LATIN, "烈咬陆鲨")).toBe(false);
  });

  test("a wildcard stands for a whole block", () => {
    expect(unicodeRangeCovers("U+4??", "Ж")).toBe(true); // U+0416
    expect(unicodeRangeCovers("U+4??", "Z")).toBe(false);
  });

  test("an astral character is read as one code point", () => {
    expect(unicodeRangeCovers("U+1F600-1F64F", "x😀")).toBe(true);
  });
});

describe("shareImage", () => {
  const realNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  const stubShare = (share: (data: ShareData) => Promise<void>) =>
    Object.defineProperty(globalThis, "navigator", {
      value: { share },
      configurable: true,
    });
  afterEach(() => {
    if (realNavigator) Object.defineProperty(globalThis, "navigator", realNavigator);
    else Reflect.deleteProperty(globalThis, "navigator");
  });

  const blob = new Blob(["png"], { type: "image/png" });

  test("hands the browser a PNG file named for the picture and reports it shared", async () => {
    let given: ShareData | undefined;
    stubShare(async (data) => {
      given = data;
    });
    expect(await shareImage(blob)).toBe("shared");
    expect(given?.files).toHaveLength(1);
    expect(given?.files?.[0].name).toBe("pokenerdle-wrapped-2026.png");
    expect(given?.files?.[0].type).toBe("image/png");
  });

  test("closing the share sheet (AbortError) is a cancel, not an error", async () => {
    stubShare(async () => {
      throw new DOMException("Share canceled", "AbortError");
    });
    expect(await shareImage(blob)).toBe("cancelled");
  });

  test("any other failure is thrown to the caller", async () => {
    const denied = new DOMException("not allowed", "NotAllowedError");
    stubShare(async () => {
      throw denied;
    });
    await expect(shareImage(blob)).rejects.toBe(denied);

    const broken = new TypeError("no share");
    stubShare(async () => {
      throw broken;
    });
    await expect(shareImage(blob)).rejects.toBe(broken);
  });
});

describe("finishesUpTo", () => {
  test("offers the earned finish and every finish below it", () => {
    expect(finishesUpTo("standard")).toEqual(["standard"]);
    expect(finishesUpTo("foil")).toEqual(["standard", "foil"]);
    expect(finishesUpTo("gold")).toEqual(["standard", "foil", "gold"]);
    expect(finishesUpTo("rainbow")).toEqual(["standard", "foil", "gold", "rainbow"]);
  });
});
