import { createFileRoute } from "@tanstack/react-router";
import PathFinderRules from "../../pages/HowToPlay/PathFinderRules";

export const Route = createFileRoute("/how-to-play/path-finder")({
  component: PathFinderRules,
  head: () => ({
    meta: [
      { title: "Path Finder Rules – PokéNerdle" },
      { property: "og:title", content: "Path Finder Rules – PokéNerdle" },
    ],
  }),
});
