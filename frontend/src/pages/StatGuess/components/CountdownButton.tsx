import { Button } from "@/components/ui/Button";
import React from "react";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- prefer type aliases
type CountdownButtonProps = {
  progress: number; // 0..1
  onClick: () => void;
  children: React.ReactNode;
};

const SIZE = 56;
const STROKE = 3;
const RADIUS = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;

const CountdownButton: React.FC<CountdownButtonProps> = ({
  progress,
  onClick,
  children,
}) => {
  return (
    <div className="tw:relative tw:inline-flex">
      <svg
        width={SIZE}
        height={SIZE}
        className="tw:absolute tw:inset-0 tw:pointer-events-none tw:-rotate-90"
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="currentColor"
          strokeOpacity={0.2}
          strokeWidth={STROKE}
          fill="none"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="currentColor"
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - progress)}
          strokeLinecap="round"
        />
      </svg>
      <Button
        onClick={onClick}
        className="tw:rounded-full"
        style={{ width: SIZE, height: SIZE }}
      >
        {children}
      </Button>
    </div>
  );
};

export default CountdownButton;
