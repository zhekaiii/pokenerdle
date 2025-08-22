import { PathFinderResponse } from "@pokenerdle/shared";
import posthog from "posthog-js";
import { useEffect, useRef } from "react";

type UseEventTrackingProps = {
  challenge: PathFinderResponse | null;
  isPuzzleSolved: boolean;
  startTime: number;
  numGuesses: number;
};

export const useEventTracking = ({
  challenge,
  isPuzzleSolved,
  startTime,
  numGuesses,
}: UseEventTrackingProps) => {
  const currentPathRef = useRef(location.pathname);

  const reportAbandon = () => {
    if (challenge && !isPuzzleSolved) {
      posthog.capture("pathfinder_end_attempt", {
        optimal_length: challenge.pathLength,
        time_taken_ms: Date.now() - startTime,
        num_guesses: numGuesses,
      });
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => reportAbandon();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge, isPuzzleSolved]);

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps -- currentPathRef does not contain a node reference
      if (location.pathname !== currentPathRef.current) {
        reportAbandon();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge, isPuzzleSolved]);

  return {
    reportAbandon,
  };
};
