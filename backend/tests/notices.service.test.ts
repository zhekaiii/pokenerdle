import { describe, expect, test } from "bun:test";
import { createNoticesSource } from "../src/services/notices.service.js";

const valid = {
  id: "ok",
  template: "pokedex",
  titleKey: "notices:x.title",
  action: { type: "signIn" },
};

const setup = (responses: Array<unknown | Error>) => {
  let t = 0;
  let calls = 0;
  const source = createNoticesSource({
    now: () => t,
    fetchPayload: async () => {
      const r = responses[Math.min(calls, responses.length - 1)];
      calls++;
      if (r instanceof Error) throw r;
      return r;
    },
  });
  return {
    source,
    advance: (ms: number) => (t += ms),
    calls: () => calls,
  };
};

describe("createNoticesSource", () => {
  test("caches within ttl", async () => {
    const s = setup([{ home: [valid] }]);
    await s.source.getPlacement("home");
    s.advance(59_000);
    await s.source.getPlacement("home");
    expect(s.calls()).toBe(1);
  });

  test("refetches after ttl", async () => {
    const s = setup([{ home: [valid] }]);
    await s.source.getPlacement("home");
    s.advance(60_001);
    await s.source.getPlacement("home");
    expect(s.calls()).toBe(2);
  });

  test("keeps last good value when fetch returns undefined", async () => {
    const s = setup([{ home: [valid] }, undefined]);
    await s.source.getPlacement("home");
    s.advance(60_001);
    expect(await s.source.getPlacement("home")).toHaveLength(1);
  });

  test("keeps last good value when fetch throws", async () => {
    const s = setup([{ home: [valid] }, new Error("down")]);
    await s.source.getPlacement("home");
    s.advance(60_001);
    expect(await s.source.getPlacement("home")).toHaveLength(1);
  });

  test("explicit empty object replaces cache", async () => {
    const s = setup([{ home: [valid] }, {}]);
    await s.source.getPlacement("home");
    s.advance(60_001);
    expect(await s.source.getPlacement("home")).toEqual([]);
  });

  test("no good value ever yields empty list", async () => {
    const s = setup([new Error("down")]);
    expect(await s.source.getPlacement("home")).toEqual([]);
  });

  test("garbage payload yields empty list without throwing", async () => {
    const s = setup(["not json obj"]);
    expect(await s.source.getPlacement("home")).toEqual([]);
  });
});
