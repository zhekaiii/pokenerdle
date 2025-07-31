import React from "react";
import AnimatedNumber from "../recyclables/AnimatedNumber";
import { Card } from "../ui/Card";

type GameHeaderProps = {
  playerPoints: number;
  opponentPoints: number;
};

const GameHeader: React.FC<GameHeaderProps> = ({
  playerPoints,
  opponentPoints,
}) => {
  return (
    <Card>
      <div className="tw-flex tw-justify-between tw-items-center tw-px-4 tw-py-2">
        <div>
          <b className="tw-block">Player</b>
          <small>
            <AnimatedNumber as="span" number={playerPoints} /> points
          </small>
        </div>
        <div className="tw-text-end">
          <b className="tw-block">Opponent</b>
          <small>
            <AnimatedNumber as="span" number={opponentPoints} /> points
          </small>
        </div>
      </div>
    </Card>
  );
};

export default GameHeader;
