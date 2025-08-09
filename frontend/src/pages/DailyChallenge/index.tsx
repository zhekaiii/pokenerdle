import React, { useState } from "react";
import DailyChallengeGameplay from "./components/Gameplay";
import DailyChallengeIntroCard from "./components/IntroCard";

enum DailyChallengeState {
  Intro,
  Gameplay,
}

const DailyChallengePage: React.FC = () => {
  const [state, setState] = useState(DailyChallengeState.Intro);
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
