import React from "react";
import classes from "./PageContainer.module.scss";

type Props = {
  children: React.ReactNode;
};

const PageContainer: React.FC<Props> = ({ children }) => {
  return <main className={classes.PageContainer}>{children}</main>;
};

export default PageContainer;
