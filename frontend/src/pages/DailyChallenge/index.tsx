import LoadingDialog from "@/components/recyclables/LoadingDialog";
import React, { useState } from "react";
import DailyChallengeGameplay from "./components/Gameplay";
import DailyChallengeIntroCard from "./components/IntroCard";
import { useDailyChallengeData } from "./hooks/useData";
import { useSyncData } from "./hooks/useSyncData";

enum DailyChallengeState {
  Intro,
  Gameplay,
}

const DailyChallengePage: React.FC = () => {
  const { isNewDay } = useDailyChallengeData();
  const [state, setState] = useState(
    isNewDay ? DailyChallengeState.Intro : DailyChallengeState.Gameplay
  );
  const onStart = () => {
    setState(DailyChallengeState.Gameplay);
  };
  const { isSyncing } = useSyncData();
  return (
    <>
      {state === DailyChallengeState.Intro ? (
        <DailyChallengeIntroCard onStart={onStart} />
      ) : (
        <DailyChallengeGameplay />
      )}
      <LoadingDialog open={isSyncing} />
    </>
  );
};

export const Component = DailyChallengePage;

Component.displayName = "DailyChallenge";

export default Component;
