import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaLock, FaKey, FaExclamationTriangle } from 'react-icons/fa';

/**
 * Modal that appears when a user enters incorrect credentials
 */
const IncorrectCredentialsModal = ({ isOpen, onClose, email, onForgotPassword }) => {
  console.log("IncorrectCredentialsModal - isOpen:", isOpen, "email:", email);
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar animation at the top */}
        <motion.div
          className="h-1 bg-red-500"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.5 }}
        />

        {/* Header with lock icon */}
        <motion.div
          className="bg-red-500 p-6 flex justify-center items-center"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
        >
          <motion.div
            className="bg-white rounded-full h-16 w-16 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <motion.div
              animate={{
                rotate: [0, -10, 10, -10, 10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 0.8,
                repeat: 1,
                repeatDelay: 1
              }}
            >
              <FaKey className="text-red-500 text-3xl" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              Incorrect Credentials
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">
              The password you've entered is incorrect.
            </p>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
            <div className="flex items-start">
              <FaExclamationTriangle className="text-amber-500 mr-3 mt-1 flex-shrink-0" />
              <div className="text-amber-700 text-sm">
                <p className="mb-2">Please check:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Your password is case-sensitive</li>
                  <li>Caps Lock is not turned on</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              onClick={() => {
                onClose();
                if (onForgotPassword) onForgotPassword();
              }}
            >
              Forgot Password
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              onClick={onClose}
            >
              Try Again
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default IncorrectCredentialsModal;
