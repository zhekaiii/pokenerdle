import React from "react";
import AnimatedNumber from "../recyclables/AnimatedNumber";
import { Card } from "../ui/Card";
import { usePokeChainContext } from "./context/PokeChainContext";

type GameHeaderProps = {
  playerPoints: number;
  opponentPoints: number;
  playerStreak: number;
  opponentStreak: number;
};

const GameHeader: React.FC<GameHeaderProps> = ({
  playerPoints,
  opponentPoints,
  playerStreak,
  opponentStreak,
}) => {
  const { isSinglePlayer } = usePokeChainContext();
  return (
    <Card>
      <div className="tw:flex tw:justify-between tw:items-center tw:px-4 tw:py-2">
        <div>
          <b className="tw:block">Player</b>
          <small className="tw:me-1">
            <AnimatedNumber as="span" number={playerPoints} /> points
          </small>
          <small>🔥 {playerStreak}</small>
        </div>
        {!isSinglePlayer && (
          <div className="tw:text-end">
            <b className="tw:block">Opponent</b>
            <small className="tw:me-1">
              <AnimatedNumber as="span" number={opponentPoints} /> points
            </small>
            <small>🔥 {opponentStreak}</small>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GameHeader;
