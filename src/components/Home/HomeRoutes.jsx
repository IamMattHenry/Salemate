import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export const HomeRoutes = ({className = ""}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Custom navigation handler with animation
  const handleNavigation = (path) => {
    // Only navigate if we're not already on that page
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  // Animation variants for the navigation items
  const navItemVariants = {
    hover: {
      scale: 1.05,
      backgroundColor: "rgba(255, 207, 80, 0.3)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.95,
      backgroundColor: "rgba(255, 207, 80, 0.5)"
    },
    active: {
      backgroundColor: "rgba(255, 207, 80, 0.4)",
      scale: 1.02,
      fontWeight: "bold"
    }
  };

  // Container animation for the entire navigation bar
  const containerVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        delayChildren: 0.2,
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  // Item animation for each navigation button
  const itemVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        bounce: 0.4
      }
    }
  };

  return (
    <motion.div
      className={`bg-white z-[100] absolute left-1/2 -translate-x-1/2 top-5 block mx-auto rounded-3xl md:w-10/12 shadow-feat w-10/12 ${className}`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      whileHover={{ boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)" }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between w-full md:text-xl">
        <motion.button
          className={`font-lato font-semibold rounded-2xl py-5 px-10 relative overflow-hidden nav-hover-effect button-glow ${location.pathname === "/privacypolicy" ? "text-amber-600 font-bold" : ""}`}
          onClick={() => handleNavigation("/privacypolicy")}
          variants={itemVariants}
          whileHover="hover"
          whileTap="tap"
          animate={location.pathname === "/privacypolicy" ? "active" : ""}
        >
          <span className="relative z-10">Privacy Policy</span>
          <motion.div
            className="absolute inset-0 bg-yellowsm/0 rounded-2xl -z-0"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>

        <motion.button
          className={`font-lato font-semibold rounded-2xl py-5 px-10 relative overflow-hidden nav-hover-effect button-glow ${location.pathname === "/contact" ? "text-amber-600 font-bold" : ""}`}
          onClick={() => handleNavigation("/contact")}
          variants={itemVariants}
          whileHover="hover"
          whileTap="tap"
          animate={location.pathname === "/contact" ? "active" : ""}
        >
          <span className="relative z-10">Contact Us</span>
          <motion.div
            className="absolute inset-0 bg-yellowsm/0 rounded-2xl -z-0"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>

        <motion.button
          className={`font-lato font-semibold rounded-2xl py-5 px-10 relative overflow-hidden nav-hover-effect button-glow ${location.pathname === "/about" ? "text-amber-600 font-bold" : ""}`}
          onClick={() => handleNavigation("/about")}
          variants={itemVariants}
          whileHover="hover"
          whileTap="tap"
          animate={location.pathname === "/about" ? "active" : ""}
        >
          <span className="relative z-10">About Us</span>
          <motion.div
            className="absolute inset-0 bg-yellowsm/0 rounded-2xl -z-0"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>

        <motion.button
          className={`font-lato font-semibold rounded-2xl py-5 px-10 relative overflow-hidden nav-hover-effect button-glow ${location.pathname === "/terms-and-condition" ? "text-amber-600 font-bold" : ""}`}
          onClick={() => handleNavigation("/terms-and-condition")}
          variants={itemVariants}
          whileHover="hover"
          whileTap="tap"
          animate={location.pathname === "/terms-and-condition" ? "active" : ""}
        >
          <span className="relative z-10">Terms and Condition</span>
          <motion.div
            className="absolute inset-0 bg-yellowsm/0 rounded-2xl -z-0"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>

        <motion.button
          className={`font-lato font-semibold rounded-2xl py-5 px-10 relative overflow-hidden nav-hover-effect button-glow ${location.pathname === "/features" ? "text-amber-600 font-bold" : ""}`}
          onClick={() => handleNavigation("/features")}
          variants={itemVariants}
          whileHover="hover"
          whileTap="tap"
          animate={location.pathname === "/features" ? "active" : ""}
        >
          <span className="relative z-10">Features</span>
          <motion.div
            className="absolute inset-0 bg-yellowsm/0 rounded-2xl -z-0"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>
      </div>
    </motion.div>
  );
};
