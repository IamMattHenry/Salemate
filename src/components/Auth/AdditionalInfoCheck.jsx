import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import AdditionalInfoModal from './AdditionalInfoModal';

const AdditionalInfoCheck = () => {
  const { currentUser, userProfile, pinVerified } = useAuth();
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
              console.log("User hasn't completed additional info, showing modal");
              setShowAdditionalInfoModal(true);
            } else {
              console.log("User has already completed additional info");
              setShowAdditionalInfoModal(false);
            }
          } else {
            // If userProfile isn't loaded yet, fetch it directly
            const userDocRef = doc(db, "users", currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              if (userData.additionalInfoCompleted === undefined || userData.additionalInfoCompleted === false) {
                console.log("User hasn't completed additional info, showing modal");
                setShowAdditionalInfoModal(true);
              } else {
                console.log("User has already completed additional info");
                setShowAdditionalInfoModal(false);
              }
            } else {
              // If user document doesn't exist, show the modal
              console.log("User document not found, showing additional info modal");
              setShowAdditionalInfoModal(true);
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

  // Handle modal close
  const handleClose = () => {
    setShowAdditionalInfoModal(false);
  };

  // Handle skip
  const handleSkip = () => {
    setShowAdditionalInfoModal(false);
  };

  return (
    <>
      {showAdditionalInfoModal && (
        <AdditionalInfoModal 
          isOpen={showAdditionalInfoModal} 
          onClose={handleClose} 
          onSkip={handleSkip} 
        />
      )}
    </>
  );
};

export default AdditionalInfoCheck;
