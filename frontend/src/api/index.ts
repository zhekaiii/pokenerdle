import { posthogDistinctIdAtom, sessionAtom } from "@/atoms/auth";
import { store } from "@/atoms/store";
import axios, { AxiosInstance } from "axios";
import { Store } from "jotai/vanilla/store";
import posthog from "posthog-js";
import battles from "./battles";
import daily from "./daily";
import data from "./data/data";
import pathfinder from "./pathfinder/pathfinder";

export const BACKEND_URL = import.meta.env.SSR
  ? `http://localhost:${process.env.PORT || 3456}`
  : import.meta.env.PROD
  ? ""
  : import.meta.env.VITE_BACKEND_URL;

const createAxiosInstance = (store?: Store): AxiosInstance => {
  const instance = axios.create({
    baseURL: `${BACKEND_URL}/api`,
  });

  if (store) {
    instance.interceptors.request.use((config) => {
      const session = store.get(sessionAtom);
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      } else {
        if (import.meta.env.SSR) {
          const distinctId = store.get(posthogDistinctIdAtom);
          if (distinctId) {
            config.headers["X-PostHog-Distinct-Id"] = distinctId;
          }
        } else {
          config.headers["X-PostHog-Distinct-Id"] = posthog.get_distinct_id();
        }
      }
      return config;
    });
  }

  return instance;
};

export const createApi = (store?: Store) => {
  const axiosInstance = createAxiosInstance(store);

  return {
    daily: daily(axiosInstance),
    data: data(axiosInstance),
    battles: battles(axiosInstance),
    pathfinder: pathfinder(axiosInstance),
  };
};

const api = createApi(store);

export default api;
