import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import { ArrowDown, ArrowUp, Check, X } from "lucide-react";
import { COLUMNS } from "../constants";
import EffectivenessIcon from "./EffectivenessIcon";

interface Props {
  guess: DailyChallengeGuessResponse;
  colKey: (typeof COLUMNS)[number]["key"];
}

export const DailyChallengeGuessIcon: React.FC<Props> = ({ guess, colKey }) => {
  if (guess.correct) return <Check />;
  const value = guess[colKey];
  if (value === true || value === "=") {
    return <Check />;
  }
  if (value === "<") {
    return <ArrowDown />;
  }
  if (value === ">") {
    return <ArrowUp />;
  }
  if (value === false) {
    return <X />;
  }
  return <EffectivenessIcon value={value} />;
};
