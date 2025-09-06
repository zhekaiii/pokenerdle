import clsx from "clsx";
import React from "react";
import useDetectKeyboardOpen from "use-detect-keyboard-open";
import classes from "./PageContainer.module.scss";
interface Props {
  children: React.ReactNode;
}

const PageContainer: React.FC<Props> = ({ children }) => {
  const isKeyboardOpen = import.meta.env.SSR
    ? false
    : // eslint-disable-next-line react-hooks/rules-of-hooks -- only used in client
      useDetectKeyboardOpen();
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
