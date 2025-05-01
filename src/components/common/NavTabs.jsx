import React from "react";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";

const NavTabs = ({
  links,
  searchProps,
  actionButton,
  onSearch,
  className = "",
}) => {
  const location = useLocation();

  return (
    <div className="w-full grid grid-cols-[60%_1fr] h-auto mb-3">
      <div className="font-lato font-medium flex justify-start items-center space-x-12">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `text-black transition-all ${
                isActive ? "" : "text-black/60 hover:text-black"
              }`
            }
          >
            {({ isActive }) => (
              <span
                className={`
                  relative 
                  inline-block
                  text-[1.2rem]
                  after:content-[""]
                  after:absolute
                  after:-bottom-1
                  after:left-1/4
                  after:w-1/2
                  after:h-0.5
                  after:bg-current
                  after:transition-opacity
                  ${
                    isActive
                      ? "after:opacity-100"
                      : "after:opacity-0 hover:after:opacity-100"
                  }
                `}
              >
                {link.label}
              </span>
            )}
          </NavLink>
        ))}
      </div>
      <div>
        <div className="flex justify-end items-center gap-3 sm:gap-5 w-full relative">
          {searchProps && (
            <div className="relative w-full max-w-xs sm:max-w-sm md:w-2/3">
              <input
                type="text"
                placeholder={searchProps.placeholder}
                onChange={(e) => onSearch(e.target.value)}
                className="font-lato bg-white border border-gray-500 h-9 pl-3 pr-10 rounded-2xl text-sm placeholder:text-gray-500 w-full focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
              <searchProps.icon
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none"
                aria-hidden="true"
              />
            </div>
          )}

          {actionButton && (
            <button
              type="button"
              className={`text-dark-600 p-1.5 border border-gray-600 bg-white rounded-full cursor-pointer hover:bg-gray-100 transition-colors shrink-0 ${actionButton.buttonClassName || ''}`}
              onClick={actionButton.onClick}
              aria-label={actionButton.label || "Action"}
            >
              <actionButton.icon className="text-2xl" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavTabs;
