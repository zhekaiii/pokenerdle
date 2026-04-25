import StatGuesserPage from "@/pages/StatGuesser";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/stat-guesser")({
  component: StatGuesserPage,
  context: () => ({
    shouldShowRuleButton: true,
  }),
  head: () => ({
    meta: [
      { title: "Stat Guesser – PokéNerdle" },
      { property: "og:title", content: "Stat Guesser – PokéNerdle" },
    ],
  }),
});
