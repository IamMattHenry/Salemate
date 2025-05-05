import React from "react";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";

const NavTabs = ({
  links,
  searchProps,
  saveButton,
  actionButton,
  onSearch,
  className = "",
}) => {
  const location = useLocation();

  return (
    <div className="w-full flex justify-between items-center mb-3">
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

      <div className="flex items-center gap-3">
        {actionButton && (
          <button
            onClick={actionButton.onClick}
            className="flex items-center gap-2 bg-[#FFCF50] hover:bg-[#e6bb48] text-black px-4 py-2 rounded-full font-medium text-sm transition-all duration-200"
            aria-label={actionButton.label}
          >
            {actionButton.label}
            <actionButton.icon className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default NavTabs;
