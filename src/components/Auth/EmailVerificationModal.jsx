import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

/**
 * Modal that appears when a user tries to sign in without verifying their email
 * Provides an option to resend the verification email
 */
const EmailVerificationModal = ({ isOpen, onClose, email, password }) => {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState('');

  // Function to resend verification email
  const handleResendVerification = async () => {
    setIsResending(true);
    setError('');
    setResendSuccess(false);

    try {
      // Get the current user
      const user = auth.currentUser;

      if (user) {
        // Send verification email
        await sendEmailVerification(user, {
          url: window.location.origin + "/signin", // Redirect URL after verification
          handleCodeInApp: false,
        });

        setResendSuccess(true);
      } else {
        setError('Unable to resend verification email. Please try signing in again.');
      }
    } catch (err) {
      console.error('Error sending verification email:', err);
      setError('Failed to send verification email. Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

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
            className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with envelope icon */}
            <motion.div
              className="bg-amber-500 p-6 flex justify-center items-center"
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 200, delay: 0.2 }}
            >
              <div className="bg-white/20 rounded-full p-3">
                <FaEnvelope className="text-white text-3xl" />
              </div>
            </motion.div>

            {/* Content */}
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Email Verification Required
              </h2>

              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                  <div className="flex items-start">
                    <FaExclamationTriangle className="text-amber-500 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-amber-700 text-sm">
                      Please verify your email before signing in. Check your inbox for a verification link.
                    </p>
                  </div>
                </div>

                {email && (
                  <div className="flex items-center space-x-2 text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                    <FaEnvelope className="text-gray-500" />
                    <span className="font-medium">{email}</span>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {resendSuccess && (
                  <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2" />
                    <p className="text-green-700 text-sm">
                      Verification email sent successfully! Please check your inbox.
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={handleResendVerification}
                    disabled={isResending || resendSuccess}
                    className={`w-full py-3 rounded-xl font-medium transition-all ${
                      isResending
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : resendSuccess
                        ? "bg-green-500 text-white"
                        : "bg-amber-500 text-white hover:bg-amber-600"
                    }`}
                  >
                    {isResending
                      ? "Sending..."
                      : resendSuccess
                      ? "Email Sent!"
                      : "Resend Verification Email"}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmailVerificationModal;
