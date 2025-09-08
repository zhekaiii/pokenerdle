import { createApi } from "@/api";
import PathFinderGame from "@/components/PathFinder/PathFinderGame";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/path-finder")({
  component: PathFinderGame,
  context: () => ({
    shouldShowRuleButton: true,
  }),
  head: () => ({
    meta: [
      { title: "Path Finder – PokéNerdle" },
      { property: "og:title", content: "Path Finder – PokéNerdle" },
    ],
  }),
  loader: async ({ context: { store } }) => {
    const api = createApi(store);
    return await api.pathfinder.getChallenge();
  },
});
