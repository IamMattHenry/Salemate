import React from "react";

const DashboardBrand = ({ isMinimized }) => {
  return (
    <div className="w-full mt-5">
      <h3
        className={`${
          isMinimized
            ? "text-yellowsm text-center flex flex-col items-center"
            : "text-yellowsm flex justify-center space-x-2 text-center items-center"
        }`}
      >
        <span
          className={`${
            isMinimized
              ? "font-redacted font-bold text-5xl -mb-3 mt-3"
              : "font-redacted font-bold text-5xl"
          }`}
        >
          S
        </span>
      </h3>
    </div>
  );
};

export default DashboardBrand;
