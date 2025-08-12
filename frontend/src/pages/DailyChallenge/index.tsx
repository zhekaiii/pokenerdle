import React, { useState } from "react";
import DailyChallengeGameplay from "./components/Gameplay";
import DailyChallengeIntroCard from "./components/IntroCard";
import { useDailyChallengeData } from "./hooks/useData";

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
  return state === DailyChallengeState.Intro ? (
    <DailyChallengeIntroCard onStart={onStart} />
  ) : (
    <DailyChallengeGameplay />
  );
};

export default DailyChallengePage;
