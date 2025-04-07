import React from "react";
import { NavLink } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";

const OrdersNav = () => {
  const OrderNavLinks = [
    { path: "/all-transactions", label: "All Transactions" },
    { path: "/completed-transactions", label: "Completed" },
    { path: "/pending-transactions", label: "Pending" },
    { path: "/cancelled-transactions", label: "Cancelled" },
    { path: "/saved-history", label: "Saved History" },
  ];

  return (
    <div className="w-full grid grid-cols-[60%_1fr] h-auto place-items-center">
      <div className="font-lato text-bold text-[1rem] gap-2 flex">
        {OrderNavLinks.map((orderLinks) => (
          <NavLink key={orderLinks.path} to={orderLinks.path} >
            <span>{orderLinks.label}</span>
          </NavLink>
        ))}
      </div>
      <div>
      <div className="relative w-1/3">
          <input
            type="text"
            placeholder="Search"
            className="font-lato bg-white border-[1px] border-gray-500 pl-3 pr-7 pt-1 pb-0.5 rounded-2xl text-sm placeholder:text-gray-500 w-full"
          />
          <IoIosSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs" />
        </div>
      </div>
    </div>
  );
};

export default OrdersNav;
