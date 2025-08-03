import React from "react";
import { Outlet } from "react-router";

const HowToPlayPage: React.FC = () => {
  return (
    <div className="tw:max-w-3xl tw:mx-auto">
      <Outlet />
    </div>
  );
};

export default HowToPlayPage;
