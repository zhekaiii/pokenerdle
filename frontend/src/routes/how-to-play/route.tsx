import HowToPlayPage from "@/pages/HowToPlay";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/how-to-play")({
  component: HowToPlayPage,
  context: () => ({
    shouldShowRuleButton: true,
  }),
});
