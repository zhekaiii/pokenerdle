import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/how-to-play/$")({
  beforeLoad: () => {
    throw redirect({
      to: "/how-to-play/daily",
      replace: true,
    });
  },
});
