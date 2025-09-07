import { createFileRoute } from "@tanstack/react-router";
import DailyChallenge from "../pages/DailyChallenge";

export const Route = createFileRoute("/daily")({
  component: DailyChallenge,
  context: () => ({
    shouldShowRuleButton: true,
  }),
  head: () => ({
    meta: [
      { title: "Daily Challenge – PokéNerdle" },
      { property: "og:title", content: "Daily Challenge – PokéNerdle" },
      {
        name: "description",
        content:
          "Play the Daily Challenge and test your Pokémon knowledge! Guess the daily mystery Pokémon in 8 tries or less!",
      },
      {
        property: "og:description",
        content:
          "Play the Daily Challenge and test your Pokémon knowledge! Guess the daily mystery Pokémon in 8 tries or less!",
      },
    ],
  }),
});
