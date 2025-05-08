import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { FaLock, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const PinVerification = ({ onSuccess }) => {
  const { hasPin, verifyPin, createPin, userProfile, accountLocked, lockoutEndTime, pinAttempts } = useAuth();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreatingPin, setIsCreatingPin] = useState(false);
  const [remainingLockoutTime, setRemainingLockoutTime] = useState(null);

  useEffect(() => {
    // If user doesn't have a PIN, show the create PIN form
    if (!hasPin) {
      setIsCreatingPin(true);
    }
  }, [hasPin]);

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

  const handlePinChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to 4 digits
    if (/^\d*$/.test(value) && value.length <= 4) {
      setPin(value);
    }
  };

  const handleConfirmPinChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to 4 digits
    if (/^\d*$/.test(value) && value.length <= 4) {
      setConfirmPin(value);
    }
  };

  const handleVerifyPin = async (e) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    const result = await verifyPin(pin);

    if (result.success) {
      setSuccess('PIN verified successfully');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1000);
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
  };

  const handleCreatePin = async (e) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    const created = await createPin(pin);
    if (created) {
      setSuccess('PIN created successfully');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1000);
    } else {
      setError('Failed to create PIN. Please try again.');
    }
  };

  return (
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
              ? 'Create a 4-digit PIN to secure sensitive areas'
              : `Welcome back, ${userProfile?.firstName || 'User'}. Please enter your PIN to continue.`
            }
          </p>
        </div>

        <form onSubmit={isCreatingPin ? handleCreatePin : handleVerifyPin} className="space-y-4">
          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
              {isCreatingPin ? 'New PIN' : 'PIN'}
            </label>
            <input
              type="password"
              id="pin"
              value={pin}
              onChange={handlePinChange}
              placeholder="Enter 4-digit PIN"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center text-xl tracking-widest"
              inputMode="numeric"
              autoFocus
            />
          </div>

          {isCreatingPin && (
            <div>
              <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm PIN
              </label>
              <input
                type="password"
                id="confirmPin"
                value={confirmPin}
                onChange={handleConfirmPinChange}
                placeholder="Confirm 4-digit PIN"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center text-xl tracking-widest"
                inputMode="numeric"
              />
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

          <button
            type="submit"
            className={`w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-4 rounded-xl transition duration-200 mt-4 ${accountLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={accountLocked}
          >
            {isCreatingPin ? 'Create PIN' : 'Verify PIN'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default PinVerification;
