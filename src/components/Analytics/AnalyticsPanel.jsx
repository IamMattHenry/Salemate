import React from "react";
import AnalyticsNav from "./AnalyticsNav";
import { Outlet } from "react-router-dom";

const AnalyticsPanel = () => {
  return (
    <section className="grid grid-rows-[10%_1fr] w-auto h-[87.5%] mx-7 p-3">
      <AnalyticsNav />
      <Outlet />
    </section>
  );
};

export default AnalyticsPanel;
