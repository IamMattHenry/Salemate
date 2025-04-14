import React from "react";
import DashboardBrand from "./DashboardBrand";
import SideRoutes from "./SideRoutes";
import DashboardSideToggle from "./DashboardSideToggle";
import DashboardLogout from "./DashboardLogout";

const DashboardSideNav = ({ toggleSideNav, isMinimized }) => {
  return (
    <div
      className={`flex flex-col items-center pt-3 bg-gradient-to-b from-whitesm from-15% via-yellowf via-60% to-yellowsm to-90% overflow-y-hidden}`}
    >
      <div>
        <DashboardSideToggle toggleSideNav={toggleSideNav} isMinimized={isMinimized}/>
        <DashboardBrand isMinimized={isMinimized} />
      </div>
      <SideRoutes isMinimized={isMinimized} />
      <DashboardLogout isMinimized={isMinimized}/>
    </div>
  );
};

export default DashboardSideNav;
