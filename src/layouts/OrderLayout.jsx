import React, { useState } from "react";
import DashboardSideNav from "../components/Dashboard/DashboardSideNav";
import { motion } from "framer-motion";
import Order from "../pages/Orders";

const OrderLayout = () => {
  const [isMinimized, setSideNav] = useState(true);

  const toggleSideNav = () => {
    setSideNav(!isMinimized);
  }

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
        <Order />
      </div>
    </motion.main>
  );
};

export default OrderLayout;
