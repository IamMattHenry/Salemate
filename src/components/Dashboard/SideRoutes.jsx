import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  MdDashboard,
  MdInventory,
  MdAnalytics,
  MdShoppingCart,
  MdPeople,
  MdAdminPanelSettings,
  MdBlock
} from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import AccessDeniedModal from "../Auth/AccessDeniedModal";

const SideRoutes = ({ isMinimized }) => {
  const { resetPinVerification, hasAccess, userProfile, pinVerified, isAdmin } = useAuth();
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [currentModule, setCurrentModule] = useState(null);

  // Base routes for all users
  let routes = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <MdDashboard />,
      requiresPin: false,
      module: "dashboard"
    },
    {
      path: "/orders",
      label: "Orders",
      icon: <MdShoppingCart />,
      requiresPin: false,
      module: "orders"
    },
    {
      path: "/analytics",
      label: "Analytics",
      icon: <MdAnalytics />,
      requiresPin: true,
      module: "analytics"
    },
    {
      path: "/inventory",
      label: "Inventory",
      icon: <MdInventory />,
      requiresPin: true,
      module: "inventory"
    },
    {
      path: "/customer",
      label: "Customer",
      icon: <MdPeople />,
      requiresPin: true,
      module: "customer"
    },
  ];

  // Add User Accounts route for admin users only
  if (isAdmin()) {
    routes.push({
      path: "/admin/user-accounts",
      label: "User Accounts",
      icon: <MdAdminPanelSettings />,
      requiresPin: false,
      module: "admin"
    });
  }

  // Check if user is in Financial department for PIN verification
  const isFinancial = userProfile?.department === 'Financial';

  // Handle route click
  const handleRouteClick = (e, route) => {
    // Check if user has access to this module
    if (!hasAccess(route.module)) {
      e.preventDefault(); // Prevent navigation
      setCurrentModule(route.module);
      setShowAccessDenied(true);
      return;
    }
  };

  return (
    <>
      {showAccessDenied && (
        <AccessDeniedModal
          module={currentModule}
          onClose={() => setShowAccessDenied(false)}
        />
      )}

      <div className="w-full font-lato font-semibold space-y-3 h-full flex flex-col items-center justify-center">
        <div className="flex flex-col w-full">
          {routes.map((route) => {
            const hasRouteAccess = hasAccess(route.module);

            return (
              <NavLink
                key={route.path}
                to={route.path}
                onClick={(e) => handleRouteClick(e, route)}
                className={({ isActive }) =>
                  `${
                    isActive
                      ? "flex items-center space-x-2 shadow-sm mb-1 py-2 px-5 w-full bg-[#ffcf50]/30"
                      : "flex items-center space-x-3 my-2 py-2 px-5 w-full hover:bg-[#ffcf50]/30 transition-all"
                  }`
                }
              >
                <div className="relative">
                  {hasRouteAccess ? (
                    <span className="text-xl text-black">{route.icon}</span>
                  ) : (
                    <div className="relative">
                      <span className="text-xl text-gray-400">{route.icon}</span>
                      <MdBlock className="absolute -top-1 -right-1 text-xs text-red-500" />
                    </div>
                  )}
                </div>

                {!isMinimized && (
                  <span className={`mt-1 ${hasRouteAccess ? "text-black" : "text-gray-400"}`}>
                    {route.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default SideRoutes;
