import { createFileRoute } from "@tanstack/react-router";
import PokeChain from "../components/PokeChain";

export const Route = createFileRoute("/pokechain")({
  component: PokeChain,
  context: () => ({
    shouldShowRuleButton: true,
  }),
  head: () => ({
    meta: [
      { title: "PokéChain – PokéNerdle" },
      { property: "og:title", content: "PokéChain – PokéNerdle" },
    ],
  }),
});
