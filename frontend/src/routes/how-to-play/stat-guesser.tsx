import { createFileRoute } from "@tanstack/react-router";
import StatGuesserRules from "../../pages/HowToPlay/StatGuesserRules";

export const Route = createFileRoute("/how-to-play/stat-guesser")({
  component: StatGuesserRules,
  head: () => ({
    meta: [
      { title: "Stat Guesser Rules – PokéNerdle" },
      { property: "og:title", content: "Stat Guesser Rules – PokéNerdle" },
    ],
  }),
});
