import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrashAlt, FaEnvelope, FaUserSlash } from 'react-icons/fa';

const DeletedAccountModal = ({ isOpen, onClose, email }) => {
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
            className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden animate-flip"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{
              scale: 1,
              y: 0,
              opacity: 1
            }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gray header with trash icon */}
            <motion.div
              className="bg-gray-800 p-6 flex justify-center items-center"
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{
                  scale: [0.5, 1.2, 1],
                  opacity: 1,
                  rotate: [0, 0, 10, -10, 0]
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.3,
                  times: [0, 0.5, 0.7, 0.9, 1]
                }}
              >
                <FaTrashAlt className="text-white text-5xl" />
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
                Account Deleted
              </motion.h3>

              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-700 text-sm">
                    This account has been permanently deleted by an administrator and cannot be recovered.
                  </p>
                </div>

                {email && (
                  <div className="flex items-center space-x-2 text-gray-600 text-sm">
                    <FaEnvelope />
                    <span>{email}</span>
                  </div>
                )}

                <div className="flex items-center p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <FaUserSlash className="text-blue-500 mr-3 flex-shrink-0" />
                  <p className="text-blue-700 text-sm">
                    If you believe this is an error, please contact your system administrator to create a new account.
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
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
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

export default DeletedAccountModal;
