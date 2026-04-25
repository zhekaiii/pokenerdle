import { createFileRoute } from "@tanstack/react-router";
import StatGuessRules from "../../pages/HowToPlay/StatGuessRules";

export const Route = createFileRoute("/how-to-play/stat-guess")({
  component: StatGuessRules,
  head: () => ({
    meta: [
      { title: "Stat Guess Rules – PokéNerdle" },
      { property: "og:title", content: "Stat Guess Rules – PokéNerdle" },
    ],
  }),
});
