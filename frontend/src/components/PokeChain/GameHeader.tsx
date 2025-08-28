import React from "react";
import AnimatedNumber from "../recyclables/AnimatedNumber";
import { Card } from "../ui/Card";
import { usePokeChainContext } from "./context/PokeChainContext";

interface GameHeaderProps {
  playerPoints: number;
  opponentPoints: number;
  playerStreak: number;
  opponentStreak: number;
  chainLength: number;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  playerPoints,
  opponentPoints,
  playerStreak,
  opponentStreak,
  chainLength,
}) => {
  const { isSinglePlayer } = usePokeChainContext();
  return (
    <Card>
      <div className="tw:flex tw:justify-between tw:items-center tw:px-4 tw:py-2 tw:gap-2">
        <div>
          <b className="tw:block">Player</b>
          <small className="tw:me-1">
            <AnimatedNumber as="span" number={playerPoints} /> points
          </small>
          <small>🔥 {playerStreak}</small>
        </div>
        <div className={isSinglePlayer ? "tw:text-end" : "tw:text-center"}>
          <b className="tw:block">PokéChain</b>
          <small className="tw:me-1">Length: {chainLength}</small>
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
