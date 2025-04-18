import React from "react";
import { BsArrowLeftCircle, BsList } from "react-icons/bs";
import { motion } from "motion/react"

const DashboardSideToggle = ({ toggleSideNav, isMinimized }) => {
  const MotionBsArrowLeftCircle = motion(BsArrowLeftCircle);
  const MotionBsList = motion(BsList);

  return (
    <div className={isMinimized ? "flex w-full justify-center" : "flex justify-end w-full"}>
      <button
      type="button"
      onClick={toggleSideNav}
    >
      {isMinimized ? (
        <MotionBsList
        className="text-black mx-3 size-7 cursor-pointer hover:text-yellowsm"
        animate={{ rotate: -180 }}
        transition={{ duration: 0.3 }}
      />
      ) : (
        <MotionBsArrowLeftCircle
      className="text-black mx-3 size-7 cursor-pointer hover:text-yellowsm"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.3 }}
    />
      )}
    </button>
    </div>
  );
};

export default DashboardSideToggle;
