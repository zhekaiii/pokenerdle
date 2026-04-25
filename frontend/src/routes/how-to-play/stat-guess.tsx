import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/how-to-play/stat-guess")({
  beforeLoad: () => {
    throw redirect({ to: "/how-to-play/stat-guesser", replace: true });
  },
});
