import { Outlet } from "@tanstack/react-router";
import React from "react";
import PageContainer from "./PageContainer";
import Header from "./components/Header";
import MobileFooter from "./components/MobileFooter";

const Layout: React.FC = () => {
  return (
    <PageContainer>
      <Header />
      <Outlet />
      <MobileFooter />
    </PageContainer>
  );
};

export default Layout;
