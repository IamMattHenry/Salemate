import React from "react";
import { motion } from "framer-motion";

function Footer() {
  // Animation variants for staggered children animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      className="w-full"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="w-full text-center">
        {/* Centered Logo */}
        <motion.div
          className="flex justify-center items-center pt-20 pb-7"
          variants={itemVariants}
        >
          <motion.a
            href="/"
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <img
              className="w-[200px] drop-shadow-md"
              src="/salemate.png"
              alt="Salemate Logo"
            />
          </motion.a>
        </motion.div>

        <motion.hr
          className="h-0.5 my-5 w-[80%] max-w-[1200px] mx-auto bg-gray-700 border-0 rounded-lg opacity-10"
          variants={itemVariants}
        ></motion.hr>

        {/* Navigation Links with Hover Animation */}
        <motion.div
          className="flex text-[15px] md:text-[17px] font-league spartan font-medium text-center justify-center px-4 py-2"
          variants={itemVariants}
        >
          {/* Responsive layout - wraps on mobile, single row on larger screens */}
          <div className="flex flex-wrap md:flex-nowrap justify-between items-center w-full max-w-4xl mx-auto px-4 gap-y-3">
            <motion.div
              whileHover={{ scale: 1.05, color: "#FFCF50" }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <a href="/contact" className="relative group inline-block">
                Contact Us
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, color: "#FFCF50" }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <a href="/privacypolicy" className="relative group inline-block">
                Privacy Policy
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, color: "#FFCF50" }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <a href="/about" className="relative group inline-block">
                About Us
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, color: "#FFCF50" }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <a href="/terms-and-condition" className="relative group inline-block whitespace-nowrap">
                Terms and Conditions
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, color: "#FFCF50" }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <a href="/features" className="relative group inline-block">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </motion.div>
          </div>
        </motion.div>

        <motion.hr
          className="h-0.5 my-5 w-[80%] max-w-[1200px] mx-auto bg-gray-700 border-0 rounded-lg opacity-10"
          variants={itemVariants}
        ></motion.hr>

        <motion.p
          className="mt-3 font-lato text-gray-600 text-sm pb-10 pt-5"
          variants={itemVariants}
        >
          Copyright &copy; 2025 Salemate. All Rights Reserved.
        </motion.p>
      </div>
    </motion.div>
  );
}

export default Footer;
