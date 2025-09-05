import { createFileRoute } from "@tanstack/react-router";
import DailyChallengeRules from "../../pages/HowToPlay/DailyChallengeRules";

export const Route = createFileRoute("/how-to-play/daily")({
  component: DailyChallengeRules,
});
