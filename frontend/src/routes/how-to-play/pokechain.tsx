import { createFileRoute } from "@tanstack/react-router";
import PokeChainRules from "../../pages/HowToPlay/PokeChainRules";

export const Route = createFileRoute("/how-to-play/pokechain")({
  component: PokeChainRules,
  head: () => ({
    meta: [
      { title: "PokéChain Rules – PokéNerdle" },
      { property: "og:title", content: "PokéChain Rules – PokéNerdle" },
    ],
  }),
});
