import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import AdditionalInfoModal from "./AdditionalInfoModal";
import PinVerification from "./PinVerification";

/**
 * This component manages the flow for new users:
 * 1. First shows the AdditionalInfoModal to collect user information
 * 2. Then shows the PinVerification component to create a PIN
 */
const NewUserSetup = () => {
  const {
    currentUser,
    additionalInfoCompleted,
    hasPin,
    pinVerified,
    hasCompletedInitialSetup
  } = useAuth();

  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [showPinCreation, setShowPinCreation] = useState(false);
  const hasSkippedAdditionalInfo = useRef(false);

  // Determine which modal to show based on user state
  useEffect(() => {
    if (!currentUser) {
      // No user logged in, don't show anything
      setShowAdditionalInfo(false);
      setShowPinCreation(false);
      hasSkippedAdditionalInfo.current = false;
      return;
    }

    if (hasCompletedInitialSetup) {
      // User has completed the initial setup, don't show anything
      setShowAdditionalInfo(false);
      setShowPinCreation(false);
      return;
    }

    // If user has skipped additional info in this session, don't show it again
    if (hasSkippedAdditionalInfo.current) {
      setShowAdditionalInfo(false);
      if (!hasPin) {
        setShowPinCreation(true);
      }
      return;
    }

    if (!additionalInfoCompleted) {
      // User hasn't completed additional info, show that first
      setShowAdditionalInfo(true);
      setShowPinCreation(false);
    } else if (!hasPin) {
      // User has completed additional info but doesn't have a PIN
      setShowAdditionalInfo(false);
      setShowPinCreation(true);
    } else {
      // User has completed both steps
      setShowAdditionalInfo(false);
      setShowPinCreation(false);
    }
  }, [currentUser, additionalInfoCompleted, hasPin, pinVerified, hasCompletedInitialSetup]);

  // Handle closing the additional info modal
  const handleAdditionalInfoClose = () => {
    setShowAdditionalInfo(false);
    setShowPinCreation(true);
  };

  // Handle skipping the additional info
  const handleAdditionalInfoSkip = () => {
    setShowAdditionalInfo(false);
    setShowPinCreation(true);
    // Mark as skipped for this session
    hasSkippedAdditionalInfo.current = true;
  };

  // Handle PIN creation success
  const handlePinCreationSuccess = () => {
    setShowPinCreation(false);
  };

  return (
    <>
      {/* Additional Info Modal */}
      <AdditionalInfoModal
        isOpen={showAdditionalInfo}
        onClose={handleAdditionalInfoClose}
        onSkip={handleAdditionalInfoSkip}
      />

      {/* PIN Creation */}
      {showPinCreation && (
        <PinVerification onSuccess={handlePinCreationSuccess} />
      )}
    </>
  );
};

export default NewUserSetup;
