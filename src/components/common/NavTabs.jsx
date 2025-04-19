import React from "react";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";

const NavTabs = ({ links, searchProps, actionButton, saveButton, className = "" }) => {
const location = useLocation();
  return (
    <div className="w-full grid grid-cols-[60%_1fr] h-auto place-content-center">
      <div className="font-lato font-medium text-[1.05rem] justify-around items-center">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `text-black transition-all ${className} ${
                isActive ? "" : "text-black/60 hover:text-black"
              }`
            }
          >
            {({ isActive }) => (
              <span
                className={`
                  relative inline-block
                  text-[20px]
                  ml-9
                  after:content-[""]
                  after:absolute
                  after:-bottom-1
                  after:left-1/4
                  after:w-1/2
                  after:h-0.5
                  after:bg-current
                  after:transition-opacity
                  ${isActive ? "after:opacity-100" : "after:opacity-0 hover:after:opacity-100"}
                `}
              >
                {link.label}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      <div>
        <div className="flex justify-end w-full">
          <div className="flex justify-around gap-5 ml-15 items-center w-[100%]">
            {searchProps && (
              <div className="relative w-1/2 pr-">
                <input
                  type="text"
                  placeholder={searchProps.placeholder}
                  className="font-lato bg-white border-[1px] border-gray-500 h-9 pl-3 pr-7 pt-1 pb-0.5 rounded-2xl text-sm placeholder:text-gray-500 w-56"
                />
                <searchProps.icon className="absolute -right-1 top-1/2 text-[15px] transform -translate-y-1/2 text-dark-500 text-xs" />
              </div>
            )}

            {saveButton && location.pathname !== "/inventory/saved-history" && (
              <button
                type="button"
                className="bg-[#FFCF50] border border-[#D4A734] w-30 h-9 text-dark-600 font-medium px-2 py-1 border rounded-4xl flex items-center justify-center gap-1 cursor-pointer"
                onClick={saveButton.onClick}
              >
                <span className="text-sm">{saveButton.label}</span>
                <saveButton.icon className="text-lg" />
              </button>
            )}

            {actionButton && (
              <button
                type="button"
                className="text-dark-600 p-1 border-gray-600 bg-white text-[25px] border rounded-4xl cursor-pointer"
                onClick={actionButton.onClick}
              >
                <actionButton.icon />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavTabs;
