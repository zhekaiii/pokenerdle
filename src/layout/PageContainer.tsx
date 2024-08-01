import React from "react";
import classes from "./PageContainer.module.scss";

type Props = {
  children: React.ReactNode;
};

const PageContainer: React.FC<Props> = ({ children }) => {
  return <div className={classes.PageContainer}>{children}</div>;
};

export default PageContainer;
