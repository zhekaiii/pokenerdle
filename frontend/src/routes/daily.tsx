import { createFileRoute } from "@tanstack/react-router";
import DailyChallenge from "../pages/DailyChallenge";

export const Route = createFileRoute("/daily")({
  component: DailyChallenge,
  context: () => ({
    shouldShowRuleButton: true,
  }),
  head: () => ({
    meta: [{ title: "Daily Challenge – PokéNerdle" }],
  }),
});
