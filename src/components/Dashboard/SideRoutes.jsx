import React from "react";
import { NavLink } from "react-router-dom";
import {
  BsFillCartFill,
  BsGraphUp,
  BsFillBoxFill,
  BsFillPeopleFill,
} from "react-icons/bs";
import { SiDashlane } from "react-icons/si";

const SideRoutes = ({ isMinimized }) => {
  const routes = [
    { path: "/dashboard", label: "Dashboard", icon: <SiDashlane /> },
    { path: "/orders", label: "Orders", icon: <BsFillCartFill /> },
    { path: "/analytics", label: "Analytics", icon: <BsGraphUp /> },
    { path: "/inventory", label: "Inventory", icon: <BsFillBoxFill /> },
    { path: "/customer", label: "Customer", icon: <BsFillPeopleFill /> },
  ];

  return (
    <div className="w-full font-lato font-semibold space-y-3 h-full flex flex-col items-center justify-center">
      <div className="flex flex-col -mt-20 w-full">
        {routes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            className={({ isActive }) =>
              `${
                isActive
                  ? "flex items-center space-x-2 shadow-sm mb-1 py-2 px-5 w-full bg-[#ffcf50]/30"
                  : "flex items-center space-x-3 my-2 py-2 px-5 w-full hover:bg-[#ffcf50]/30 transition-all"
              }`
            }
          >

            <span className="text-xl text-black">{route.icon}</span>

            {!isMinimized && (
              <span className="mt-1 text-black">{route.label}</span>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default SideRoutes;
