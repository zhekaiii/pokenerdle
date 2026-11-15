import { describe, expect, test } from "bun:test";
import type { Notice } from "@pokenerdle/shared/notices";
import { resolveNoticeText } from "../src/components/Notice/text";

const strings: Record<string, string> = {
  "notices:s.title": "Save your results",
  "notices:s.cta": "Sign in",
};
const t = (key: string) => strings[key] ?? key;
const exists = (key: string) => key in strings;

const n = (over: Partial<Notice>): Notice => ({
  id: "a",
  template: "pokedex",
  titleKey: "notices:s.title",
  action: { type: "signIn" },
  ...over,
});

describe("resolveNoticeText", () => {
  test("translates existing keys", () => {
    expect(resolveNoticeText(n({ ctaKey: "notices:s.cta" }), t, exists)).toEqual({
      title: "Save your results",
      cta: "Sign in",
      tag: undefined,
      body: undefined,
    });
  });
  test("missing title hides the notice", () => {
    expect(resolveNoticeText(n({ titleKey: "notices:typo.title" }), t, exists)).toBeNull();
  });
  test("missing optional key is left out instead of showing the raw key", () => {
    expect(resolveNoticeText(n({ bodyKey: "notice:s.body" }), t, exists)?.body).toBeUndefined();
  });
});
