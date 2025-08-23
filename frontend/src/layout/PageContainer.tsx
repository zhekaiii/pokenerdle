import clsx from "clsx";
import React from "react";
import useDetectKeyboardOpen from "use-detect-keyboard-open";
import classes from "./PageContainer.module.scss";
type Props = {
  children: React.ReactNode;
};

const PageContainer: React.FC<Props> = ({ children }) => {
  const isKeyboardOpen = useDetectKeyboardOpen();
  return (
    <main
      className={clsx(
        classes.PageContainer,
        isKeyboardOpen && classes.KeyboardOpen
      )}
    >
      {children}
    </main>
  );
};

export default PageContainer;
