import { describe, expect, test } from "bun:test";
import axios, { type InternalAxiosRequestConfig } from "axios";
import createDataApi from "../src/api/data/data";

const makeApi = (responseData: unknown) => {
  const requests: InternalAxiosRequestConfig[] = [];
  const instance = axios.create({
    adapter: async (config) => {
      requests.push(config);
      return {
        config,
        data: responseData,
        status: 200,
        statusText: "OK",
        headers: { "last-modified": "Sat, 31 Oct 2026 00:00:00 GMT" },
      };
    },
  });
  return { api: createDataApi(instance), requests };
};

describe("reference API requests use browser-managed HTTP validation", () => {
  test("names return the response body without timestamp metadata or conditional headers", async () => {
    const data = [{ id: 1, name: "妙蛙種子", speciesName: "妙蛙種子" }];
    const { api, requests } = makeApi(data);
    expect(await api.getPokemonNames("zh-Hant")).toEqual(data);
    expect(requests[0].url).toBe("/v1/data/pokemon-names");
    expect(requests[0].params).toEqual({ lang: "zh-Hant" });
    expect(requests[0].headers.has("If-Modified-Since")).toBe(false);
    expect(requests[0].headers.has("If-None-Match")).toBe(false);
  });

  test("icons preserve null entries and return the body without manual validators", async () => {
    const data = { 1: "/sprites/1.png", 2: null };
    const { api, requests } = makeApi(data);
    expect(await api.getPokemonIcons()).toEqual(data);
    expect(requests[0].url).toBe("/v1/data/pokemon-icons");
    expect(requests[0].headers.has("If-Modified-Since")).toBe(false);
    expect(requests[0].headers.has("If-None-Match")).toBe(false);
  });

  test("generation takes only its generation number and returns the ID array", async () => {
    const data = [152, 153, 154];
    const { api, requests } = makeApi(data);
    expect(await api.getPokemonIdsByGeneration(2)).toEqual(data);
    expect(requests[0].url).toBe("/v1/data/pokemon-generations");
    expect(requests[0].params).toEqual({ generation: 2 });
    expect(requests[0].headers.has("If-Modified-Since")).toBe(false);
    expect(requests[0].headers.has("If-None-Match")).toBe(false);
  });
});
