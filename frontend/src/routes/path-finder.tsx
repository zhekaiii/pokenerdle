import { createFileRoute } from "@tanstack/react-router";
import PathFinder from "../components/PathFinder";

export const Route = createFileRoute("/path-finder")({
  component: PathFinder,
  context: () => ({
    shouldShowRuleButton: true,
  }),
});
