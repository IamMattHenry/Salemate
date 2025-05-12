import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import AdditionalInfoModal from './AdditionalInfoModal';

const AdditionalInfoCheck = () => {
  const { currentUser, userProfile, pinVerified } = useAuth();
  // Always keep the modal hidden
  const [showAdditionalInfoModal, setShowAdditionalInfoModal] = useState(false);
  const [checkingInfo, setCheckingInfo] = useState(false);

  useEffect(() => {
    // Only check for additional info if:
    // 1. User is logged in
    // 2. PIN is verified (if required)
    // 3. We're not already checking
    if (currentUser && pinVerified && !checkingInfo) {
      const checkAdditionalInfo = async () => {
        try {
          setCheckingInfo(true);

          // If we already have userProfile loaded, use that
          if (userProfile) {
            if (userProfile.additionalInfoCompleted === undefined || userProfile.additionalInfoCompleted === false) {
              console.log("User hasn't completed additional info, but we're skipping the modal");
              // Automatically mark as completed instead of showing the modal
              const userDocRef = doc(db, "users", currentUser.uid);
              await updateDoc(userDocRef, {
                additionalInfoCompleted: true,
                lastUpdated: new Date().toISOString()
              });
              console.log("Automatically marked additional info as completed");
            } else {
              console.log("User has already completed additional info");
            }
          } else {
            // If userProfile isn't loaded yet, fetch it directly
            const userDocRef = doc(db, "users", currentUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const userData = userDoc.data();
              if (userData.additionalInfoCompleted === undefined || userData.additionalInfoCompleted === false) {
                console.log("User hasn't completed additional info, but we're skipping the modal");
                // Automatically mark as completed instead of showing the modal
                await updateDoc(userDocRef, {
                  additionalInfoCompleted: true,
                  lastUpdated: new Date().toISOString()
                });
                console.log("Automatically marked additional info as completed");
              } else {
                console.log("User has already completed additional info");
              }
            } else {
              // If user document doesn't exist, just skip the modal
              console.log("User document not found, but we're skipping the additional info modal");
            }
          }
        } catch (error) {
          console.error("Error checking additional info:", error);
        } finally {
          setCheckingInfo(false);
        }
      };

      checkAdditionalInfo();
    }
  }, [currentUser, pinVerified, userProfile, checkingInfo]);

  // These handlers are kept for compatibility but won't be used
  const handleClose = () => {
    setShowAdditionalInfoModal(false);
  };

  const handleSkip = () => {
    setShowAdditionalInfoModal(false);
  };

  // Return empty fragment - never show the modal
  return <></>;
};

export default AdditionalInfoCheck;
