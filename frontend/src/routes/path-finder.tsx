import { createFileRoute } from "@tanstack/react-router";
import PathFinder from "../components/PathFinder";

export const Route = createFileRoute("/path-finder")({
  component: PathFinder,
  context: () => ({
    shouldShowRuleButton: true,
  }),
  head: () => ({
    meta: [
      { title: "Path Finder – PokéNerdle" },
      { property: "og:title", content: "Path Finder – PokéNerdle" },
    ],
  }),
});
