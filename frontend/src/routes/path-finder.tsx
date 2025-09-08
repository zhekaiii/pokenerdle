import api from "@/api";
import PathFinderGame from "@/components/PathFinder/PathFinderGame";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/path-finder")({
  component: PathFinderGame,
  context: () => ({
    shouldShowRuleButton: true,
  }),
  loader: api.pathfinder.getChallenge,
});
