import { cn } from "@/lib/utils";
import React from "react";
import styles from "../index.module.scss";

interface Props {
  children: React.ReactNode;
  className?: string;
}

const GridItem: React.FC<Props> = ({ className, children }) => {
  return (
    <div className={cn(styles["DailyChallengeGameplay__GridItem"], className)}>
      {children}
    </div>
  );
};

export default GridItem;
