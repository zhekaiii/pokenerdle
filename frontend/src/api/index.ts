import axios from "axios";
import data from "./data";

axios.defaults.baseURL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const api = {
  data,
};

export default api;
