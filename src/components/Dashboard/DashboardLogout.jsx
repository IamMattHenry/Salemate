import React, { useState } from "react";
import { CiPower } from "react-icons/ci";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdWarning } from "react-icons/io";

const DashboardLogout = ({ isMinimized }) => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully.");
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error.message);
    }
  };

  return (
    <>
      <button
        type="button"
        className="flex items-center justify-center p-2 space-x-2 cursor-pointer mb-10"
        onClick={() => setShowLogoutConfirm(true)}
      >
        <CiPower className="text-2xl text-black" />
        {!isMinimized && (
          <span className="font-lato text-[1.05rem] font-semibold">Logout</span>
        )}
      </button>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/25 flex items-center justify-center z-[1000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white w-[28rem] font-lato rounded-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="w-full flex items-center justify-between px-4 py-2 bg-[#ff3434] text-white">
                <div className="flex items-center gap-2">
                  <IoMdWarning className="text-2xl" />
                  <span className="font-medium text-lg -mb-1">Confirm Logout</span>
                </div>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="hover:opacity-70 text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-6 text-center">
                  <p className="text-lg font-semibold mb-2">
                    Are you sure you want to logout?
                  </p>
                  <p className="text-gray-600">
                    You'll need to sign in again to access your account.
                  </p>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    className="px-6 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300 transition-colors cursor-pointer"
                    onClick={() => setShowLogoutConfirm(false)}
                  >
                    No, Stay Logged In
                  </button>
                  <button
                    className="px-6 py-2 bg-[#ff3434] text-white rounded-lg font-medium hover:bg-[#e62e2e] transition-colors cursor-pointer"
                    onClick={handleLogout}
                  >
                    Yes, Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardLogout;