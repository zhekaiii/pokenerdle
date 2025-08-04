import axios from "axios";
import battles from "./battles";
import data from "./data/data";
import pathfinder from "./pathfinder/pathfinder";

axios.defaults.baseURL = import.meta.env.PROD
  ? "/api"
  : `${import.meta.env.VITE_BACKEND_URL}/api`;

const api = {
  data,
  battles,
  pathfinder,
};

export default api;
