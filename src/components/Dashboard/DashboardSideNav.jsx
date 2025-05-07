import React from "react";
import DashboardBrand from "./DashboardBrand";
import SideRoutes from "./SideRoutes";
import DashboardSideToggle from "./DashboardSideToggle";
import DashboardLogout from "./DashboardLogout";
import { BsXCircleFill, BsKeyboard } from "react-icons/bs";

const DashboardSideNav = ({ toggleSideNav, isMinimized }) => {
  return (
    <div
      className={`flex flex-col pt-3 bg-gradient-to-b from-whitesm from-5% via-yellowf via-40% to-yellowsm to-90% min-h-full relative`}
    >
      {/* Close button for mobile/tablet view */}
      {!isMinimized && (
        <>
          <button
            className="md:hidden absolute top-3 right-3 z-10 text-black hover:text-red-500 transition-colors"
            onClick={toggleSideNav}
            aria-label="Close sidebar"
          >
            <BsXCircleFill size={24} />
          </button>

          {/* No visible text, just a subtle icon with tooltip */}
          <div
            className="hidden md:block absolute bottom-3 right-3 opacity-30 hover:opacity-60 transition-opacity cursor-help"
            title="Press Esc to close sidebar"
          >
            <BsKeyboard size={12} className="text-amber-900" />
          </div>
        </>
      )}

      <div className="w-full">
        <DashboardSideToggle toggleSideNav={toggleSideNav} isMinimized={isMinimized}/>
        <DashboardBrand isMinimized={isMinimized} />
      </div>
      <SideRoutes isMinimized={isMinimized} />
      <DashboardLogout isMinimized={isMinimized}/>

      {/* Overlay to close sidebar when clicking outside on mobile */}
      {!isMinimized && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-[-1]"
          onClick={toggleSideNav}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default DashboardSideNav;
