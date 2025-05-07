import React, { useEffect } from "react";
import DashboardSideNav from "../components/Dashboard/DashboardSideNav";
import { motion } from "framer-motion";
import Orders from "../pages/Main/Orders"
import { useSidebar } from "../context/SidebarContext";
import { useLoading } from "../context/LoadingContext";

const OrderLayout = () => {
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
  }, []);

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
      <div className="pb-5">
        <Orders />
      </div>
    </motion.main>
  );
};

export default OrderLayout;
