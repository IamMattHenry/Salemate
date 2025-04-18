import React from "react";
import { NavLink } from "react-router-dom";

const NavTabs = ({ links, searchProps, actionButton, saveButton, className = "" }) => {
  return (
    <div className="w-full grid grid-cols-[60%_1fr] h-auto place-content-center">
      <div className="font-lato font-medium text-[1.05rem] flex w-full justify-around items-center">
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
                  after:content-[""]
                  after:absolute
                  after:bottom-0
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
          <div className="flex justify-around items-center w-[80%]">
            {searchProps && (
              <div className="relative w-4/6">
                <input
                  type="text"
                  placeholder={searchProps.placeholder}
                  className="font-lato bg-white border-[1px] border-gray-500 pl-3 pr-7 pt-1 pb-0.5 rounded-2xl text-sm placeholder:text-gray-500 w-full"
                />
                <searchProps.icon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs" />
              </div>
            )}

            {saveButton && (
              <button
                type="button"
                className="text-gray-600 px-2 py-1 border-gray-600 border rounded-4xl flex items-center gap-1 cursor-pointer"
                onClick={saveButton.onClick}
              >
                <span className="text-sm">{saveButton.label}</span>
                <saveButton.icon className="text-lg" />
              </button>
            )}

            {actionButton && (
              <button
                type="button"
                className="text-gray-600 p-1 border-gray-600 border rounded-4xl cursor-pointer"
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
