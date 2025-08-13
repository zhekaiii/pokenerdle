import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import { COLUMNS } from "../constants";
import EffectivenessIcon from "./EffectivenessIcon";

type Props = {
  guess: DailyChallengeGuessResponse;
  colKey: (typeof COLUMNS)[number]["key"];
};

export const DailyChallengeGuessIcon: React.FC<Props> = ({ guess, colKey }) => {
  if (guess.correct) return <Check />;
  const value = guess[colKey];
  if (value === true || value === "=") {
    return <Check />;
  }
  if (value === "<") {
    return <ChevronDown />;
  }
  if (value === ">") {
    return <ChevronUp />;
  }
  if (value === false) {
    return <X />;
  }
  return <EffectivenessIcon value={value} />;
};
