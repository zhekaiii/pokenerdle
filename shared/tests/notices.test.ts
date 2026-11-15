import { describe, expect, test } from "bun:test";
import { type Notice, parseNoticesPayload, pickNotice } from "../src/notices/index";

const n = (over: Partial<Notice> = {}): Notice => ({
  id: "a",
  template: "pokedex",
  titleKey: "notices:x.title",
  action: { type: "signIn" },
  ...over,
});

const validRaw = {
  id: "ok",
  template: "pokedex",
  titleKey: "notices:x.title",
  action: { type: "signIn" },
};

describe("pickNotice", () => {
  test("returns first passing entry in order", () => {
    const list = [n({ id: "a", when: { signedIn: true } }), n({ id: "b" }), n({ id: "c" })];
    expect(pickNotice(list, { nowSec: 0, signedIn: false })?.id).toBe("b");
  });

  test("from is inclusive, before is exclusive", () => {
    const list = [n({ when: { from: 100, before: 200 } })];
    const at = (nowSec: number) => pickNotice(list, { nowSec, signedIn: false });
    expect(at(100)).not.toBeNull();
    expect(at(199)).not.toBeNull();
    expect(at(99)).toBeNull();
    expect(at(200)).toBeNull();
  });

  test("signedIn false excludes signed-in users", () => {
    expect(pickNotice([n({ when: { signedIn: false } })], { nowSec: 0, signedIn: true })).toBeNull();
  });

  test("returns null for empty list", () => {
    expect(pickNotice([], { nowSec: 0, signedIn: false })).toBeNull();
  });
});

describe("parseNoticesPayload", () => {
  test("keeps valid entries and drops invalid ones per entry", () => {
    const { notices, errors } = parseNoticesPayload({ home: [validRaw, { id: "bad" }] });
    expect(notices.home).toHaveLength(1);
    expect(errors).toHaveLength(1);
  });

  test("drops entries with unknown when keys", () => {
    const { notices } = parseNoticesPayload({ home: [{ ...validRaw, when: { befor: 1 } }] });
    expect(notices.home).toHaveLength(0);
  });

  test("drops unknown template", () => {
    const { notices } = parseNoticesPayload({ home: [{ ...validRaw, template: "sticker" }] });
    expect(notices.home).toHaveLength(0);
  });

  test("rejects external and protocol-relative hrefs", () => {
    const link = (href: string) => ({ ...validRaw, action: { type: "link", href } });
    const { notices } = parseNoticesPayload({
      home: [link("https://x.com"), link("//x.com"), link("/wrapped")],
    });
    expect(notices.home?.map((x) => x.action)).toEqual([{ type: "link", href: "/wrapped" }]);
  });

  test("ignores unknown placements and a non-array placement", () => {
    const { notices, errors } = parseNoticesPayload({ home: "nope", daily: [validRaw] });
    expect(notices).toEqual({});
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  test("non-object returns empty", () => {
    for (const payload of [null, [], "x"]) {
      const result = parseNoticesPayload(payload);
      expect(result.notices).toEqual({});
      expect(result.errors).toHaveLength(1);
    }
  });
});
