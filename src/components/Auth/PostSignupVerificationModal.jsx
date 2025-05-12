import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

/**
 * Modal that appears after signup to inform users they need to verify their email
 * before they can access the dashboard
 */
const PostSignupVerificationModal = ({ isOpen, onClose, email }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(2);

  // Automatically redirect to sign in page after a short delay
  useEffect(() => {
    if (isOpen) {
      // Start countdown
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Redirect after countdown reaches 0
      const redirectTimer = setTimeout(() => {
        goToSignIn();
      }, 2000); // 2 seconds delay before auto-redirect

      return () => {
        clearTimeout(redirectTimer);
        clearInterval(countdownInterval);
      };
    }
  }, [isOpen]);

  // Handle navigation to sign in page
  const goToSignIn = async () => {
    try {
      // Sign out the user first using Firebase's signOut function
      await signOut(auth);
      console.log("User signed out after account creation");

      // Clear any auth data from storage to prevent auto-login
      const apiKey = "AIzaSyDo2u1X6qkJkfc9VLgrhZTx4Y-TjKiOSi0";
      const storageKey = `firebase:authUser:${apiKey}:[DEFAULT]`;
      localStorage.removeItem(storageKey);
      sessionStorage.removeItem(storageKey);

      // Close the modal and navigate to sign in page with verification parameter
      onClose();
      navigate('/signin?verify=true');
    } catch (error) {
      console.error("Error signing out:", error);
      // Still navigate to sign in even if sign out fails
      onClose();
      navigate('/signin?verify=true');
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
                <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-start">
                  <FaCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-green-700 text-sm font-medium">
                      Account created successfully!
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                      We've sent a verification link to your email.
                    </p>
                  </div>
                </div>

                {email && (
                  <div className="flex items-center space-x-2 text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                    <FaEnvelope className="text-gray-500" />
                    <span className="font-medium">{email}</span>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                  <h3 className="font-medium text-amber-800 mb-2">Important:</h3>
                  <ul className="space-y-2 text-sm text-amber-700 list-disc pl-5">
                    <li>You must verify your email before you can sign in</li>
                    <li>Check your spam folder if you don't see the email</li>
                    <li>The verification link expires in 24 hours</li>
                    <li>You can request a new verification email on the sign-in page</li>
                  </ul>
                </div>

                <div className="pt-4 space-y-3">
                  <button
                    onClick={goToSignIn}
                    className="w-full py-3 rounded-xl font-medium transition-all bg-amber-500 text-white hover:bg-amber-600"
                  >
                    Redirecting to Sign In ({countdown}s)
                  </button>

                  <button
                    onClick={goToSignIn}
                    className="w-full py-3 rounded-xl font-medium transition-all border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Go Now
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

export default PostSignupVerificationModal;
