import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserEdit } from 'react-icons/fa';
import { X } from 'lucide-react';

const ClerkNameReminderModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white w-[26rem] rounded-2xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 flex items-center justify-between border-b border-amber-200">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-full">
                  <FaUserEdit className="text-amber-700 text-xl" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Clerk Name Required</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="mb-5">
                <p className="text-gray-700">
                  Please enter your clerk name in the input field below the inventory table before submitting.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Your name is required for audit and tracking purposes.
                </p>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors text-sm font-medium"
                >
                  I Understand
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ClerkNameReminderModal;
