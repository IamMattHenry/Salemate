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
        <a href="/">
          <span
            className={`${
              isMinimized
                ? "font-redacted font-bold text-4xl -mb-3 mt-3"
                : "font-redacted font-bold text-4xl"
            }`}
          >
            S
          </span>
        </a>
        <a href="/">
          <span
            className={`${
              isMinimized
                ? "font-quicksand font-bold text-sm"
                : "font-quicksand font-bold text-xl"
            }`}
          >
            salemate
          </span>
        </a>
      </h3>
    </div>
  );
};

export default DashboardBrand;
