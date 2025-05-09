import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLock, FaCheck, FaTimes, FaEye, FaEyeSlash, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const InitialPinVerification = () => {
  const { hasPin, verifyPin, createPin, userProfile, pinVerified, currentUser, accountLocked, lockoutEndTime, pinAttempts } = useAuth();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreatingPin, setIsCreatingPin] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [remainingLockoutTime, setRemainingLockoutTime] = useState(null);

  // Add a ref to track the last time the modal was shown
  const lastModalShownTime = useRef(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on a protected page
  const isProtectedPage = () => {
    const path = location.pathname;
    return path.startsWith('/dashboard') ||
           path.startsWith('/orders') ||
           path.startsWith('/analytics') ||
           path.startsWith('/inventory') ||
           path.startsWith('/customer') ||
           path.startsWith('/admin');
  };

  // Track if we've already shown the PIN verification modal in this session
  const [pinModalShownInSession, setPinModalShownInSession] = useState(false);

  // Track if we're in the middle of a navigation
  const [isNavigating, setIsNavigating] = useState(false);

  // Set up a navigation tracker
  useEffect(() => {
    // When location changes, set isNavigating to true
    setIsNavigating(true);

    // After a short delay, set it back to false
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    // Only show PIN verification if:
    // 1. User is logged in
    // 2. PIN is not verified
    // 3. We're on a protected page
    // 4. We haven't already shown the modal in this session
    // 5. It's been at least 2 seconds since we last showed the modal
    const now = Date.now();
    const timeSinceLastShown = now - lastModalShownTime.current;
    const debounceTime = 2000; // 2 seconds debounce

    if (currentUser && !pinVerified && isProtectedPage() && !pinModalShownInSession && timeSinceLastShown > debounceTime && !isNavigating) {
      // Update the last shown time
      lastModalShownTime.current = now;

      // Small delay to ensure this runs after navigation
      setTimeout(() => {
        setShowVerification(true);
        setPinModalShownInSession(true);
        console.log("Showing PIN verification modal");
      }, 100);
    } else if (pinVerified) {
      // If PIN is verified, hide the modal
      setShowVerification(false);
    }
  }, [currentUser, pinVerified, location.pathname, hasPin, pinModalShownInSession, isNavigating]);

  // Close the modal when PIN is verified
  useEffect(() => {
    if (pinVerified) {
      // Close the modal immediately to let the WelcomeBackModal take over
      setShowVerification(false);
      console.log("PIN is verified, hiding verification modal");
    } else {
      // If PIN verification status changes to false, reset the modal shown flag
      // This ensures the modal will show again if the user logs out and back in
      setPinModalShownInSession(false);
    }
  }, [pinVerified]);

  useEffect(() => {
    // If user doesn't have a PIN, show the create PIN form
    if (showVerification) {
      if (hasPin === false) {
        // Only if we explicitly know the user doesn't have a PIN
        console.log("User doesn't have a PIN, showing create PIN form");
        setIsCreatingPin(true);
      } else if (hasPin === true) {
        // If we explicitly know the user has a PIN
        console.log("User has a PIN, showing verify PIN form");
        setIsCreatingPin(false);
      }
    }
  }, [hasPin, showVerification]);

  // Update remaining lockout time
  useEffect(() => {
    if (accountLocked && lockoutEndTime) {
      const updateRemainingTime = () => {
        const now = new Date();
        const lockoutEnd = new Date(lockoutEndTime);

        if (now >= lockoutEnd) {
          setRemainingLockoutTime(null);
          return;
        }

        const remainingMs = lockoutEnd - now;
        const remainingSeconds = Math.ceil(remainingMs / 1000);
        setRemainingLockoutTime(remainingSeconds);
      };

      // Update immediately
      updateRemainingTime();

      // Then update every second
      const interval = setInterval(updateRemainingTime, 1000);
      return () => clearInterval(interval);
    } else {
      setRemainingLockoutTime(null);
    }
  }, [accountLocked, lockoutEndTime]);

  const handlePinChange = async (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to 4 digits
    if (/^\d*$/.test(value) && value.length <= 4) {
      setPin(value);

      // If the PIN is 4 digits, automatically try to verify it
      if (value.length === 4 && !isCreatingPin) {
        setError('');
        setIsVerifying(true);
        try {
          const result = await verifyPin(value);

          if (result.success) {
            setSuccess('PIN verified successfully');
            // Close the modal immediately - the welcome modal will show instead
            setShowVerification(false);
          } else if (result.locked) {
            // Account is locked
            const lockoutEnd = new Date(result.remainingTime);
            const formattedTime = lockoutEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            if (result.maxAttemptsReached) {
              setError(`Maximum PIN attempts reached. Account locked for 1 minute.`);
            } else {
              setError(`Account is locked. Try again after ${formattedTime}.`);
            }

            // Clear the PIN field
            setPin('');
          } else {
            // PIN is incorrect but account not locked
            if (result.remainingAttempts) {
              setError(`Invalid PIN. ${result.remainingAttempts} attempts remaining.`);
            } else {
              setError('Invalid PIN. Please try again.');
            }
            // Clear the PIN field for another attempt
            setPin('');
          }
        } catch (error) {
          setError('Error verifying PIN. Please try again.');
          setPin('');
        } finally {
          setIsVerifying(false);
        }
      }
    }
  };

  const handleConfirmPinChange = async (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to 4 digits
    if (/^\d*$/.test(value) && value.length <= 4) {
      setConfirmPin(value);

      // If both PINs are 4 digits and match, automatically create the PIN
      if (value.length === 4 && pin.length === 4 && isCreatingPin) {
        if (pin === value) {
          setError('');
          setIsVerifying(true);
          try {
            // Trigger PIN creation automatically
            const created = await createPin(pin);
            if (created) {
              setSuccess('PIN created successfully');
              // Close the modal immediately - the welcome modal will show instead
              setShowVerification(false);
            } else {
              setError('Failed to create PIN. Please try again.');
              // Clear the fields for another attempt
              setPin('');
              setConfirmPin('');
            }
          } catch (error) {
            setError('Error creating PIN. Please try again.');
            setPin('');
            setConfirmPin('');
          } finally {
            setIsVerifying(false);
          }
        } else {
          setError('PINs do not match');
        }
      }
    }
  };

  const handleVerifyPin = async (e) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyPin(pin);

      if (result.success) {
        setSuccess('PIN verified successfully');
        // Close the modal immediately - the welcome modal will show instead
        setShowVerification(false);
      } else if (result.locked) {
        // Account is locked
        const lockoutEnd = new Date(result.remainingTime);
        const formattedTime = lockoutEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (result.maxAttemptsReached) {
          setError(`Maximum PIN attempts reached. Account locked for 1 minute.`);
        } else {
          setError(`Account is locked. Try again after ${formattedTime}.`);
        }

        // Clear the PIN field
        setPin('');
      } else {
        // PIN is incorrect but account not locked
        if (result.remainingAttempts) {
          setError(`Invalid PIN. ${result.remainingAttempts} attempts remaining.`);
        } else {
          setError('Invalid PIN. Please try again.');
        }
        // Clear the PIN field for another attempt
        setPin('');
      }
    } catch (error) {
      setError('Error verifying PIN. Please try again.');
      setPin('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCreatePin = async (e) => {
    // Only prevent default if it's a form submission event
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    setError('');

    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setIsVerifying(true);
    try {
      const created = await createPin(pin);
      if (created) {
        setSuccess('PIN created successfully');
        // Close the modal immediately - the welcome modal will show instead
        setShowVerification(false);
      } else {
        setError('Failed to create PIN. Please try again.');
        // Clear the fields for another attempt
        setPin('');
        setConfirmPin('');
      }
    } catch (error) {
      setError('Error creating PIN. Please try again.');
      setPin('');
      setConfirmPin('');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!showVerification) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 w-96 max-w-full"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaLock className="text-amber-600 text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isCreatingPin ? 'Create Security PIN' : 'Enter Security PIN'}
            </h2>
            <p className="text-gray-600 mt-1">
              {isCreatingPin
                ? 'Create a 4-digit PIN to secure your account'
                : `Welcome back, ${userProfile?.firstName || 'User'}. Please enter your PIN to continue.`
              }
            </p>
          </div>

          <form onSubmit={isCreatingPin ? handleCreatePin : handleVerifyPin} className="space-y-4">
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
                {isCreatingPin ? 'New PIN' : 'PIN'}
              </label>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  id="pin"
                  value={pin}
                  onChange={handlePinChange}
                  placeholder="Enter 4-digit PIN"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center text-xl tracking-widest"
                  inputMode="numeric"
                  maxLength="4"
                  pattern="\d{4}"
                  autoFocus
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                {pin.length}/4 digits entered
              </p>
            </div>

            {isCreatingPin && (
              <div>
                <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm PIN
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPin ? "text" : "password"}
                    id="confirmPin"
                    value={confirmPin}
                    onChange={handleConfirmPinChange}
                    placeholder="Confirm 4-digit PIN"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center text-xl tracking-widest"
                    inputMode="numeric"
                    maxLength="4"
                    pattern="\d{4}"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                  >
                    {showConfirmPin ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {confirmPin.length}/4 digits entered
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-center text-red-500 text-sm bg-red-50 p-2 rounded-lg">
                <FaTimes className="mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center text-green-500 text-sm bg-green-50 p-2 rounded-lg">
                <FaCheck className="mr-2 flex-shrink-0" />
                {success}
              </div>
            )}

            {/* Account lockout message */}
            {accountLocked && remainingLockoutTime && (
              <div className="flex flex-col items-center text-amber-600 text-sm bg-amber-50 p-3 rounded-lg border border-amber-200 mt-2">
                <div className="flex items-center mb-2">
                  <FaExclamationTriangle className="mr-2 flex-shrink-0" />
                  <span className="font-medium">Account temporarily locked</span>
                </div>
                <p className="text-center">
                  Too many failed PIN attempts. Please wait {Math.floor(remainingLockoutTime / 60)}:{(remainingLockoutTime % 60).toString().padStart(2, '0')} before trying again.
                </p>
              </div>
            )}

            {/* Welcome message */}
            {showWelcome && (
              <div className="mt-4 text-center p-4 bg-amber-50 rounded-xl border border-amber-200 shadow-md animate-welcome-pulse">
                <h3 className="text-xl font-bold text-amber-600">
                  {isCreatingPin
                    ? `Welcome, ${userProfile?.firstName || 'User'}!`
                    : `Welcome back, ${userProfile?.firstName || 'User'}!`}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {isCreatingPin
                    ? "Your PIN has been set up successfully."
                    : "We're glad to see you again."}
                </p>
              </div>
            )}

            {/* Only show the button if success message is not shown */}
            {!success && (
              <button
                type="submit"
                className={`w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-4 rounded-xl transition duration-200 mt-4 flex items-center justify-center ${accountLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isVerifying || success || accountLocked}
              >
                {isVerifying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isCreatingPin ? 'Creating PIN...' : 'Verifying PIN...'}
                  </>
                ) : (
                  isCreatingPin ? 'Create PIN' : 'Verify PIN'
                )}
              </button>
            )}
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InitialPinVerification;
