import React, { useEffect } from 'react';
import DashboardSideNav from '../components/Dashboard/DashboardSideNav';
import { motion } from "framer-motion";
import Admin from '../pages/Main/Admin';
import { useSidebar } from "../context/SidebarContext";
import { useLoading } from "../context/LoadingContext";
import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const AdminLayout = () => {
  // Use the shared sidebar context instead of local state
  const { isMinimized, toggleSideNav } = useSidebar();
  const { hideLoading } = useLoading();
  const { isAdmin } = useAuth();

  // Hide loading screen when component mounts
  useEffect(() => {
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      hideLoading();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // If user is not an admin, redirect to dashboard
  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
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
        <Admin>
          <Outlet />
        </Admin>
      </div>
    </motion.main>
  );
};

export default AdminLayout;
