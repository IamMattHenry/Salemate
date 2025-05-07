import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaUser } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const WelcomeBackModal = () => {
  const { userProfile, pinVerified } = useAuth();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Show the modal when PIN is verified
    if (pinVerified) {
      console.log("PIN verified, showing welcome back modal");

      // Small delay to ensure the PIN verification modal is closed first
      const showTimer = setTimeout(() => {
        setShowModal(true);
        console.log("Welcome back modal is now visible");
      }, 500);

      // Auto-hide the modal after 4 seconds
      const hideTimer = setTimeout(() => {
        setShowModal(false);
        console.log("Welcome back modal is now hidden");
      }, 4500);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [pinVerified]);

  if (!showModal) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Semi-transparent backdrop */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

        {/* Content container */}
        <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-6 w-80 max-w-full pointer-events-auto border-2 border-amber-200"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{
            scale: 1,
            y: 0,
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 20
            }
          }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
        >
          <div className="text-center">
            <motion.div
              className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md"
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{
                scale: 1,
                rotate: 0,
                transition: {
                  delay: 0.2,
                  type: "spring",
                  stiffness: 300
                }
              }}
            >
              {userProfile?.firstName ? (
                <div className="text-3xl font-bold text-amber-600">
                  {userProfile.firstName.charAt(0)}
                </div>
              ) : (
                <FaUser className="text-amber-600 text-3xl" />
              )}
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                transition: {
                  delay: 0.3,
                  duration: 0.5
                }
              }}
            >
              <h3 className="text-2xl font-bold text-amber-600 mb-2">
                Welcome back, {userProfile?.firstName || 'User'}!
              </h3>

              <p className="text-gray-600">
                We're glad to see you again.
              </p>

              <div className="mt-4 flex justify-center">
                <motion.div
                  className="bg-green-100 text-green-700 px-4 py-2 rounded-full flex items-center"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    transition: {
                      delay: 0.5,
                      duration: 0.3
                    }
                  }}
                >
                  <FaCheckCircle className="mr-2" />
                  PIN verified successfully
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeBackModal;
