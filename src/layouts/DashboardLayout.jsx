import React, { useState } from "react";
import DashboardSideNav from "../components/Dashboard/DashboardSideNav";
import { motion } from "framer-motion";
import Dashboard from "../pages/Dashboard";

const DashboardLayout = () => {
  const [isMinimized, setSideNav] = useState(true);

  const toggleSideNav = () => {
    setSideNav(!isMinimized);
  }

  return (
    <motion.main
      className="grid min-h-screen max-w-full bg-no-repeat bg-fixed bg-gradient-to-b from-whitesm from-15% via-yellowf via-60% to-yellowsm to-90% px-1 overflow-y-hidden"
      animate={{
        gridTemplateColumns: isMinimized ? "70px 1fr" : "180px 1fr",
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
    >
      <DashboardSideNav toggleSideNav={toggleSideNav} isMinimized={isMinimized} />
      <div className="pb-5">
        <Dashboard />
      </div>
    </motion.main>
  );
};

export default DashboardLayout;
