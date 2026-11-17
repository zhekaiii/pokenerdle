import { describe, expect, test } from "bun:test";
import { pickArtwork } from "../src/utils/artwork.js";

describe("pickArtwork", () => {
  test("prefers the official artwork", () => {
    const json = JSON.stringify({
      other: { "official-artwork": { front_default: "official.png" }, home: { front_default: "home.png" } },
    });
    expect(pickArtwork(json)).toBe("official.png");
  });

  test("falls back to the HOME render", () => {
    const json = JSON.stringify({ other: { "official-artwork": { front_default: null }, home: { front_default: "home.png" } } });
    expect(pickArtwork(json)).toBe("home.png");
  });

  test("gives null when there is no artwork or no sprites row", () => {
    expect(pickArtwork(JSON.stringify({ other: {} }))).toBeNull();
    expect(pickArtwork(JSON.stringify({}))).toBeNull();
    expect(pickArtwork(undefined)).toBeNull();
  });

  test("gives null for a malformed row instead of throwing", () => {
    expect(pickArtwork("{not json")).toBeNull();
    expect(pickArtwork("null")).toBeNull();
  });
});
