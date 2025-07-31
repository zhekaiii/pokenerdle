import React, { useEffect, useState } from "react";

type Props<T extends React.ElementType> = {
  number: number;
  as?: T;
  duration?: number;
} & React.HTMLAttributes<React.ComponentProps<T>>;

const INTERVAL = 10;

const AnimatedNumber = (<T extends React.ElementType = "div">({
  number,
  as,
  duration = 1000,
  ...rest
}: Props<T>) => {
  const C = as ?? "div";
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const delta =
      Math.floor(((number - displayValue) * INTERVAL) / duration) || 1;
    const animation = setInterval(() => {
      setDisplayValue((prevValue) => {
        if (prevValue === number) {
          clearInterval(animation);
          return prevValue;
        }
        return prevValue + delta;
      });
    }, INTERVAL);
    return () => {
      clearInterval(animation);
    };
  }, [number, duration]);

  return <C {...rest}>{displayValue}</C>;
}) satisfies React.FC<Props<React.ElementType>>;

export default AnimatedNumber;
