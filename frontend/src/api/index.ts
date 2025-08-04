import axios from "axios";
import battles from "./battles";
import data from "./data/data";
import pathfinder from "./pathfinder/pathfinder";

export const BACKEND_URL = import.meta.env.PROD
  ? ""
  : `${import.meta.env.VITE_BACKEND_URL}`;

axios.defaults.baseURL = `${BACKEND_URL}/api`;

const api = {
  data,
  battles,
  pathfinder,
};

export default api;
