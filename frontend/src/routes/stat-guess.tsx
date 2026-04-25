import StatGuessPage from "@/pages/StatGuess";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/stat-guess")({
  component: StatGuessPage,
  context: () => ({
    shouldShowRuleButton: true,
  }),
  head: () => ({
    meta: [
      { title: "Stat Guess – PokéNerdle" },
      { property: "og:title", content: "Stat Guess – PokéNerdle" },
    ],
  }),
});
