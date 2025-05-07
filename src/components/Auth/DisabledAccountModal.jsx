import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaEnvelope, FaLock } from 'react-icons/fa';

const DisabledAccountModal = ({ isOpen, onClose, email }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden animate-shake"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Red header with warning icon */}
            <motion.div
              className="bg-red-500 p-6 flex justify-center items-center"
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <motion.div
                initial={{ rotate: 0, scale: 0.5 }}
                animate={{ rotate: [0, 10, -10, 10, -10, 0], scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.3,
                  scale: { duration: 0.3 },
                  rotate: { repeat: 0, repeatType: "loop" }
                }}
              >
                <FaExclamationTriangle className="text-white text-5xl" />
              </motion.div>
            </motion.div>

            {/* Content */}
            <div className="p-6">
              <motion.h3
                className="text-xl font-bold text-gray-800 mb-4 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Account Disabled
              </motion.h3>

              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                  <p className="text-red-700 text-sm">
                    Your account has been disabled by an administrator. You cannot access the system until your account is re-enabled.
                  </p>
                </div>

                {email && (
                  <div className="flex items-center space-x-2 text-gray-600 text-sm">
                    <FaEnvelope />
                    <span>{email}</span>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <p className="text-blue-700 text-sm">
                    Please contact your system administrator to have your account re-enabled.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="mt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <button
                  onClick={onClose}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Close
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DisabledAccountModal;
