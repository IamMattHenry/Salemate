import React from "react";
import { BsArrowLeftCircle, BsList } from "react-icons/bs";

const DashboardSideToggle = ({ toggleSideNav, isMinimized }) => {
  return (
    <div className="w-full flex">
      <button
      type="button"
      onClick={toggleSideNav}
      className={isMinimized ? "w-full flex justify-center" : "w-full flex justify-end"}
    >
      {isMinimized ? (
        <BsList className="text-gray-500 mx-3 size-7 cursor-pointer hover:text-yellowsm" />
      ) : (
        <BsArrowLeftCircle className="text-black mx-3 size-7 cursor-pointer hover:text-yellowsm" />
      )}
    </button>
    </div>
  );
};

export default DashboardSideToggle;
