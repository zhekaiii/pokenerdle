import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";
import express from "express";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

const loadIcons = mock(async () => ({ 1: "https://sprites.test/1.png" }));
mock.module("../../src/services/data.services.js", () => ({
  getPokemonIcons: loadIcons,
  getPokemonNames: async (languageId: number) => [
    { id: 1, name: `name-${languageId}`, speciesName: "species" },
  ],
  getPokemonIdsByGeneration: async (generation: number) => [generation],
  getPokemonWithAbilities: async () => null,
}));

const { default: dataRouter } = await import("../../src/routes/data.routes");
let server: Server;
let base: string;

beforeAll(() => {
  const app = express();
  app.use(dataRouter);
  server = app.listen(0, "127.0.0.1");
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/v1/data`;
});

afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

const getMetadata = async (path: string) => {
  const response = await fetch(base + path);
  expect(response.status).toBe(200);
  await response.json();
  return {
    etag: response.headers.get("etag")!,
    modified: response.headers.get("last-modified")!,
  };
};

describe("reference data HTTP validation", () => {
  test("200 and 304 include metadata; matching ETags skip data loading", async () => {
    const { etag, modified } = await getMetadata("/pokemon-icons");
    expect(etag.startsWith("W/\"")).toBe(true);
    expect(Number.isFinite(Date.parse(modified))).toBe(true);
    const count = loadIcons.mock.calls.length;
    const cached = await fetch(base + "/pokemon-icons", {
      headers: { "If-None-Match": etag },
    });
    expect(cached.status).toBe(304);
    expect(cached.headers.get("cache-control")).toBe("private, no-cache");
    expect(cached.headers.get("etag")).toBe(etag);
    expect(cached.headers.get("last-modified")).toBe(modified);
    expect(await cached.text()).toBe("");
    expect(loadIcons.mock.calls.length).toBe(count);
    const fresh = await fetch(base + "/pokemon-icons");
    expect(fresh.headers.get("cache-control")).toBe("private, no-cache");
    await fresh.text();
  });

  test("If-Modified-Since uses date ordering rather than equality", async () => {
    const { modified } = await getMetadata("/pokemon-icons");
    const later = new Date(Date.parse(modified) + 60_000).toUTCString();
    const earlier = new Date(Date.parse(modified) - 60_000).toUTCString();
    for (const [date, status] of [[modified, 304], [later, 304], [earlier, 200], ["invalid", 200]] as const) {
      const response = await fetch(base + "/pokemon-icons", {
        headers: { "If-Modified-Since": date },
      });
      expect(response.status).toBe(status);
      await response.text();
    }
  });

  test("ETags take precedence over timestamps and support weak comparison", async () => {
    const { etag, modified } = await getMetadata("/pokemon-icons");
    const changed = await fetch(base + "/pokemon-icons", {
      headers: { "If-None-Match": '"outdated"', "If-Modified-Since": modified },
    });
    expect(changed.status).toBe(200);
    await changed.text();
    const unchanged = await fetch(base + "/pokemon-icons", {
      headers: {
        "If-None-Match": `"outdated", ${etag.slice(2)}`,
        "If-Modified-Since": "Wed, 01 Jan 2020 00:00:00 GMT",
      },
    });
    expect(unchanged.status).toBe(304);
  });

  test("validators distinguish names languages and generation lists", async () => {
    const english = await getMetadata("/pokemon-names?lang=en");
    const chinese = await getMetadata("/pokemon-names?lang=zh-Hans");
    expect(english.etag).not.toBe(chinese.etag);
    const names = await fetch(base + "/pokemon-names?lang=zh-Hans", {
      headers: { "If-None-Match": english.etag },
    });
    expect(names.status).toBe(200);
    await names.text();
    const generation1 = await getMetadata("/pokemon-generations?generation=1");
    const generation2 = await getMetadata("/pokemon-generations?generation=2");
    expect(generation1.etag).not.toBe(generation2.etag);
    const ids = await fetch(base + "/pokemon-generations?generation=2", {
      headers: { "If-None-Match": generation1.etag },
    });
    expect(ids.status).toBe(200);
    expect(await ids.json()).toEqual([2]);
    const cached = await fetch(base + "/pokemon-generations?generation=2", {
      headers: { "If-None-Match": generation2.etag },
    });
    expect(cached.status).toBe(304);
  });

  test("invalid generation queries cannot bypass validation with a timestamp", async () => {
    const { modified } = await getMetadata("/pokemon-generations?generation=1");
    for (const query of ["", "?generation=0", "?generation=999", "?generation=1.5", "?generation=nope"]) {
      const response = await fetch(base + "/pokemon-generations" + query, {
        headers: { "If-Modified-Since": modified, "If-None-Match": "*" },
      });
      expect(response.status).toBe(400);
      expect(response.headers.get("cache-control")).toBeNull();
      await response.text();
    }
  });
});
