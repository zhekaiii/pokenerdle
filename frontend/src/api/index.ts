import { sessionAtom } from "@/atoms/auth";
import { store } from "@/atoms/store";
import axios from "axios";
import battles from "./battles";
import daily from "./daily";
import data from "./data/data";
import pathfinder from "./pathfinder/pathfinder";

export const BACKEND_URL = import.meta.env.PROD
  ? ""
  : `${import.meta.env.VITE_BACKEND_URL}`;

axios.defaults.baseURL = `${BACKEND_URL}/api`;

axios.interceptors.request.use((config) => {
  const session = store.get(sessionAtom);
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

const api = {
  daily,
  data,
  battles,
  pathfinder,
};

export default api;
