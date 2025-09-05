import { createFileRoute } from "@tanstack/react-router";
import PokeChainRules from "../../pages/HowToPlay/PokeChainRules";

export const Route = createFileRoute("/how-to-play/pokechain")({
  component: PokeChainRules,
});
