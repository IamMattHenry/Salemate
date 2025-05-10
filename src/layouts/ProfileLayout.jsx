import React, { useEffect } from "react";
import DashboardSideNav from "../components/Dashboard/DashboardSideNav";
import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import { useLoading } from "../context/LoadingContext";
import DashboardHeader from "../components/Dashboard/DashboardHeader";

const ProfileLayout = () => {
  // Use the shared sidebar context instead of local state
  const { isMinimized, toggleSideNav } = useSidebar();
  const { hideLoading } = useLoading();

  // Hide loading screen when component mounts
  useEffect(() => {
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      hideLoading();
    }, 500);

    return () => clearTimeout(timer);
  }, [hideLoading]);

  return (
    <motion.main
      className="grid min-h-screen max-w-full bg-no-repeat bg-fixed bg-gradient-to-b from-whitesm from-60% via-yellowf via-95% to-yellowsm to-100% overflow-y-hidden"
      animate={{
        gridTemplateColumns: isMinimized ? "70px 1fr" : "180px 1fr",
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
    >
      <DashboardSideNav toggleSideNav={toggleSideNav} isMinimized={isMinimized} />
      <div className="flex flex-col h-screen overflow-hidden">
        <DashboardHeader />
        <div className="flex-1 overflow-y-auto pb-5">
          <Outlet />
        </div>
      </div>
    </motion.main>
  );
};

export default ProfileLayout;
