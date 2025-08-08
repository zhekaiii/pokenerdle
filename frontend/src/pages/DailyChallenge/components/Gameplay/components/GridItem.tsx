import React from "react";
import styles from "../index.module.scss";

type Props = {
  children: React.ReactNode;
};

const GridItem: React.FC<Props> = ({ children }) => {
  return (
    <div className={styles["DailyChallengeGameplay__GridItem"]}>{children}</div>
  );
};

export default GridItem;
