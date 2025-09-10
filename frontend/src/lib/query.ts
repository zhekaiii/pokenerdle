import { QueryClient } from "@tanstack/react-query";

export const QUERY_KEY = {
  POKEMON: "pokemon",
};

export const createQueryClient = () => {
  return new QueryClient();
};
