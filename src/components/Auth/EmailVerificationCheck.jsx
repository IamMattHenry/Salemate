import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EmailVerificationModal from './EmailVerificationModal';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

/**
 * Component that checks if the user's email is verified
 * If not, it shows a modal and prevents access to protected routes
 */
const EmailVerificationCheck = () => {
  const { currentUser, emailVerified } = useAuth();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Paths that don't require email verification
  const publicPaths = ['/signin', '/signup', '/', '/about', '/contact', '/features', '/privacy-policy'];

  // Check if the current path is a public path
  const isPublicPath = () => {
    return publicPaths.some(path => location.pathname === path);
  };

  useEffect(() => {
    // Only check if user is logged in and on a protected route
    if (currentUser && !isPublicPath()) {
      // If email is not verified, show the modal
      if (!emailVerified) {
        // Sign out the user to prevent redirect loops
        (async () => {
          try {
            await auth.signOut();
            // Navigate to sign-in page
            navigate('/signin');
          } catch (err) {
            console.error("Error signing out:", err);
          }
        })();
      } else {
        setShowVerificationModal(false);
      }
    } else {
      setShowVerificationModal(false);
    }
  }, [currentUser, emailVerified, location.pathname, navigate]);

  // Function to resend verification email
  const handleResendVerification = async () => {
    try {
      if (currentUser) {
        await sendEmailVerification(currentUser, {
          url: window.location.origin + "/signin",
          handleCodeInApp: false,
        });
        return { success: true };
      }
      return { success: false, error: 'No user is signed in' };
    } catch (error) {
      console.error('Error sending verification email:', error);
      return { success: false, error: error.message };
    }
  };

  // Close modal and redirect to sign-in page
  const handleCloseModal = () => {
    setShowVerificationModal(false);
    navigate('/signin');
  };

  return (
    <>
      <EmailVerificationModal
        isOpen={showVerificationModal}
        onClose={handleCloseModal}
        email={currentUser?.email}
        onResendVerification={handleResendVerification}
      />
    </>
  );
};

export default EmailVerificationCheck;
