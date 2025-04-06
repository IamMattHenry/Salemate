import React from "react";
import { BsPersonCircle } from "react-icons/bs";

const DashboardHeader = ({ user }) => {
  const dateToday = new Date();
  const dateFormat = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = dateToday.toLocaleDateString("en-US", dateFormat);

  return (
    <div className="bg-whitesm/50 w-full pt-2">
      <div className="w-full flex justify-between items-center px-3 py-2">
        <h3 className="font-lato font-bold text-4xl">Dashboard</h3>
        <div className="flex items-center pr-3 py-1">
          <h4 className="font-lato border-r-2 py-1 pr-3">{formattedDate}</h4>

          <div className="flex items-center">
            <div className="flex flex-col text-center mx-2 leading-none">
              <h3 className="font-semibold font-lato text-xl p-0 mb-[-7px]">
                {user.userName}
              </h3>
              <span className="font-lato text-gray-400 text-sm">
                {user.fullName}
              </span>
              <span className="font-lato text-gray-500 text-sm">
                {user.department}
              </span>
            </div>
            <div>
              <BsPersonCircle className="size-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
