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
    await s.source.getPlacement("home"); // serves stale, refreshes in background
    await new Promise((resolve) => setTimeout(resolve, 0));
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

describe("createNoticesSource latency", () => {
  const never = () => new Promise<unknown>(() => {});

  test("serves the cached value while a stale refresh is still running", async () => {
    let t = 0;
    let calls = 0;
    const source = createNoticesSource({
      now: () => t,
      fetchPayload: async () => (calls++ === 0 ? { home: [valid] } : never()),
    });
    await source.getPlacement("home");
    t += 60_001;
    expect(await source.getPlacement("home")).toHaveLength(1);
    expect(calls).toBe(2);
  });

  test("first load gives up after firstLoadTimeoutMs", async () => {
    const source = createNoticesSource({ fetchPayload: never, firstLoadTimeoutMs: 20 });
    expect(await source.getPlacement("home")).toEqual([]);
  });

  test("concurrent first calls share one fetch", async () => {
    let calls = 0;
    const source = createNoticesSource({
      fetchPayload: async () => {
        calls++;
        return { home: [valid] };
      },
    });
    await Promise.all([source.getPlacement("home"), source.getPlacement("home")]);
    expect(calls).toBe(1);
  });
});
