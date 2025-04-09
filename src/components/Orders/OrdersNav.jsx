import React from "react";
import { NavLink } from "react-router-dom";
import { LiaFileDownloadSolid } from "react-icons/lia";
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
    <div className="w-full grid grid-cols-[60%_1fr] h-auto place-content-center">
      <div className="font-lato font-bold text-[1.05rem] space-x-2 flex w-[80%] justify-around items-center">
        {OrderNavLinks.map((orderLinks) => (
          <NavLink
            key={orderLinks.path}
            to={orderLinks.path}
            className={({ isActive }) =>
              `
      ${
        isActive
          ? 'relative after:content-[""] after:absolute after:bottom-0 after:left-1/4 after:w-1/2 after:h-0.5 after:bg-current'
          : 'relative hover:after:content-[""] hover:after:absolute hover:after:bottom-0 hover:after:left-1/4 hover:after:w-1/2 hover:after:h-0.5 hover:after:bg-current transition-all'
      }
      `
            }
          >
            <span>{orderLinks.label}</span>
          </NavLink>
        ))}
      </div>
      <div>
        <div className=" flex justify-end w-full">
          <div className="flex justify-around items-center w-[80%]">
            <div className="relative w-4/6">
              <input
                type="text"
                placeholder="Type name or date (mm/dd/yyyy)"
                className="font-lato bg-white border-[1px] border-gray-500 pl-3 pr-7 pt-1 pb-0.5 rounded-2xl text-sm placeholder:text-gray-500 w-full"
              />
              <IoIosSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs" />
            </div>
            <div>
              <button
                type="button"
                className="text-gray-600 p-1 border-gray-600 border rounded-4xl"
              >
                <LiaFileDownloadSolid />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersNav;
