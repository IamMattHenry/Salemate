import React from "react";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import DashboardPanel from "../components/Dashboard/DashboardPanel";

const Dashboard = () => {
  return (
    <>
      <DashboardHeader
        user={{ userName: "Christian", fullName: "Christian Joy Sanchez" }}
      />
      <DashboardPanel />
    </>
  );
};

export default Dashboard;
