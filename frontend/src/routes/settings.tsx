import { createFileRoute } from "@tanstack/react-router";
import Settings from "../pages/Settings";

export const Route = createFileRoute("/settings")({
  component: Settings,
  head: () => ({
    meta: [
      { title: "Settings – PokéNerdle" },
      { property: "og:title", content: "Settings – PokéNerdle" },
    ],
  }),
});
