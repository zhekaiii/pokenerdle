import React from "react";
import DailyChallengeIntroCard from "./components/IntroCard";

const DailyChallengePage: React.FC = () => {
  const onStart = () => {
    console.log("start");
  };
  return <DailyChallengeIntroCard onStart={onStart} />;
};

export default DailyChallengePage;
