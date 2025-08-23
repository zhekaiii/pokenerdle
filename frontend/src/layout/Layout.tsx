import breakpoints from "@/utils/breakpoints";
import React from "react";
import { Outlet } from "react-router";
import { useMedia } from "react-use";
import PageContainer from "./PageContainer";
import Header from "./components/Header";
import MobileFooter from "./components/MobileFooter";

const Layout: React.FC = () => {
  const isSmallerThanSm = useMedia(`(max-width: ${breakpoints.sm}px)`);
  return (
    <PageContainer>
      <Header />
      <Outlet />
      {isSmallerThanSm && <MobileFooter />}
    </PageContainer>
  );
};

export default Layout;
