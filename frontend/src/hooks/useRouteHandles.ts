import { RouteHandle } from "@/routes";
import { useMatches } from "react-router";

export const useRouteHandles = () => {
  const matches = useMatches();
  return matches.map((match) => (match.handle ?? {}) as RouteHandle);
};
