import React from "react";
import { Outlet } from "react-router";
import PageContainer from "./PageContainer";
import Header from "./components/Header";

const Layout: React.FC = () => {
  return (
    <PageContainer>
      <Header />
      <Outlet />
    </PageContainer>
  );
};

export default Layout;
