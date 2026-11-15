import { describe, expect, test } from "bun:test";
import axios, { type InternalAxiosRequestConfig } from "axios";
import createNoticesApi from "../src/api/notices";

describe("notices API", () => {
  test("get(home) requests /v1/notices/home and returns data", async () => {
    const data = { notice: null };
    const requests: InternalAxiosRequestConfig[] = [];
    const instance = axios.create({
      adapter: async (config) => {
        requests.push(config);
        return { config, data, status: 200, statusText: "OK", headers: {} };
      },
    });
    expect(await createNoticesApi(instance).get("home")).toEqual(data);
    expect(requests[0].url).toBe("/v1/notices/home");
  });
});
