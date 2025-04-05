import React from "react";
import { NavLink } from "react-router-dom";
import { BsFillHouseDoorFill, BsFillCartFill, BsGraphUp, BsFillBoxFill, BsFillPeopleFill } from "react-icons/bs"; 

const SideRoutes = () => {
  const routes = [
    { path: "/dashboard", label: "Dashboard", icon: <BsFillHouseDoorFill /> },
    { path: "/orders", label: "Orders", icon: <BsFillCartFill /> },
    { path: "/analytics", label: "Analytics", icon: <BsGraphUp /> },
    { path: "/inventory", label: "Inventory", icon: <BsFillBoxFill /> },
    { path: "/customer", label: "Customer", icon: <BsFillPeopleFill /> },
  ];

  return (
    <div className="mt-16 w-full font-lato font-semibold space-y-1 text-lg">
      <p className="mx-4 text-black/60">Main Menu</p>
      {routes.map((route) => (
        <NavLink
          key={route.path}
          to={route.path}
          className={({isActive}) => isActive ? "flex items-center  space-x-2 shadow-sm py-1 px-5 w-full bg-[#ffcf50]/30" : "flex items-center space-x-2 px-5 w-full hover:bg-[#ffcf50]/30 transition-all"}
        >
          {route.icon}
          <span className="mt-1 text-black/60">{route.label}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default SideRoutes;
