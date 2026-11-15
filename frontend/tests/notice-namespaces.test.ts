import { describe, expect, test } from "bun:test";
import type { Notice } from "@pokenerdle/shared/notices";
import { getNoticeNamespaces } from "../src/components/Notice/namespaces";

const n = (over: Partial<Notice>): Notice => ({
  id: "a",
  template: "pokedex",
  titleKey: "notices:a",
  action: { type: "signIn" },
  ...over,
});

describe("getNoticeNamespaces", () => {
  test("collects notices first, then other prefixes", () => {
    expect(getNoticeNamespaces(n({ titleKey: "notices:a", bodyKey: "wrapped:b" }))).toEqual(["notices", "wrapped"]);
  });
  test("unprefixed key resolves to notices", () => {
    expect(getNoticeNamespaces(n({ titleKey: "a" }))).toEqual(["notices"]);
  });
  test("duplicate prefixes appear once", () => {
    expect(getNoticeNamespaces(n({ titleKey: "wrapped:a", bodyKey: "wrapped:b", ctaKey: "wrapped:c" }))).toEqual(["notices", "wrapped"]);
  });
});
