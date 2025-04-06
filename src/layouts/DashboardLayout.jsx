import React from "react";
import DashboardSideNav from "../components/Dashboard/DashboardSideNav";
import Dashboard from "../pages/Dashboard";

const DashboardLayout = () => {
  return (
    <main className="grid grid-cols-[190px_1fr] min-h-screen max-w-full bg-no-repeat bg-fixed bg-gradient-to-b from-whitesm from-15% via-yellowf via-60% to-yellowsm to-90% pb-2 px-1 overflow-y-hidden">
      <DashboardSideNav />
      <div>
        <Dashboard />
      </div>
    </main>
  );
};

export default DashboardLayout;
