import React, { useState, useEffect } from "react";
import { BsArrowLeftCircle, BsList, BsXCircle } from "react-icons/bs";
import { motion } from "framer-motion";

const DashboardSideToggle = ({ toggleSideNav, isMinimized }) => {
  const [hasInteracted, setHasInteracted] = useState(false);

  // Fix the import for motion components
  const MotionBsArrowLeftCircle = motion(BsArrowLeftCircle);
  const MotionBsList = motion(BsList);
  const MotionBsXCircle = motion(BsXCircle);

  const handleClick = () => {
    setHasInteracted(true);
    toggleSideNav();
  };

  // Add a keyboard shortcut to close the sidebar with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isMinimized) {
        toggleSideNav();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMinimized, toggleSideNav]);

  return (
    <div className={isMinimized ? "flex w-full justify-center" : "flex justify-end w-full"}>
      <button
        type="button"
        onClick={handleClick}
        title={isMinimized ? "Expand sidebar" : "Collapse sidebar"}
        aria-label={isMinimized ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isMinimized ? (
          <MotionBsList
            className="text-black mx-3 size-7 cursor-pointer hover:text-yellowsm"
            animate={hasInteracted ? { rotate: -180 } : {}}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <MotionBsArrowLeftCircle
            className="text-black mx-3 size-7 cursor-pointer hover:text-amber-600"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </button>
    </div>
  );
};

export default DashboardSideToggle;