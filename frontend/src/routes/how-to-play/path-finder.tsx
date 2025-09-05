import { createFileRoute } from "@tanstack/react-router";
import PathFinderRules from "../../pages/HowToPlay/PathFinderRules";

export const Route = createFileRoute("/how-to-play/path-finder")({
  component: PathFinderRules,
});
