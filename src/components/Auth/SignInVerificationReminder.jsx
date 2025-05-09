import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaExclamationTriangle } from 'react-icons/fa';

/**
 * Modal that appears on the sign-in page to remind users they need to verify their email
 */
const SignInVerificationReminder = ({ isOpen, onClose }) => {
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
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with envelope icon */}
            <div className="bg-orange-400 p-6 flex justify-center items-center">
              <div className="bg-white/20 rounded-full p-3">
                <FaEnvelope className="text-white text-3xl" />
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Email Verification Required
              </h2>

              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                  <div className="flex items-start">
                    <FaExclamationTriangle className="text-amber-500 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-amber-700 text-sm">
                      You need to verify your email before signing in. Please check your inbox for a verification link.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">Important:</h3>
                  <ul className="space-y-2 text-sm text-blue-700 list-disc pl-5">
                    <li>Check your spam folder if you don't see the email</li>
                    <li>The verification link expires in 24 hours</li>
                    <li>You can request a new verification email if needed</li>
                  </ul>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="w-full py-3 rounded-lg font-medium transition-all bg-orange-400 text-white hover:bg-orange-500"
                  >
                    I Understand
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SignInVerificationReminder;
