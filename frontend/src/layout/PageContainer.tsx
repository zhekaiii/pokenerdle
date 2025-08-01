import React from "react";
import classes from "./PageContainer.module.scss";
import Header from "./components/Header";

type Props = {
  children: React.ReactNode;
};

const PageContainer: React.FC<Props> = ({ children }) => {
  return (
    <main className={classes.PageContainer}>
      <Header />
      {children}
    </main>
  );
};

export default PageContainer;
