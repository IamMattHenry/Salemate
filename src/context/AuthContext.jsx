import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import firebaseApp, { auth } from '../firebaseConfig';

// Create the context
const AuthContext = createContext();

// Define department access permissions
const departmentAccess = {
  Production: {
    dashboard: true,
    orders: true,
    analytics: false,
    inventory: true,
    customer: false,
    admin: false
  },
  Marketing: {
    dashboard: true,
    orders: true,
    analytics: false,
    inventory: false,
    customer: true,
    admin: false
  },
  Financial: {
    dashboard: true,
    orders: true,
    analytics: true,
    inventory: false,
    customer: true,
    admin: false
  }
};

// Admin emails for special access
const ADMIN_EMAILS = ['admin@gmail.com', 'adminadmin@gmail.com', 'salemate186@gmail.com'];

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasPin, setHasPin] = useState(false);
  // Initialize pinVerified from localStorage if available
  const [pinVerified, setPinVerified] = useState(() => {
    const savedPinStatus = localStorage.getItem('pinVerified');
    return savedPinStatus === 'true';
  });
  const db = getFirestore(firebaseApp);
  const navigate = useNavigate();

  // Check if user has a PIN
  const checkUserPin = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().pin) {
        console.log("User has a PIN");
        setHasPin(true);
        return true;
      } else {
        console.log("User does not have a PIN");
        setHasPin(false);
        return false;
      }
    } catch (error) {
      console.error("Error checking user PIN:", error);
      setHasPin(false);
      return false;
    }
  };

  // Create a PIN for the user
  const createPin = async (pin) => {
    if (!currentUser) return false;

    try {
      const userDocRef = doc(db, "users", currentUser.uid);

      // First check if the document exists
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(userDocRef, {
          pin: pin
        });
      } else {
        // Create new document if it doesn't exist
        await setDoc(userDocRef, {
          pin: pin,
          email: currentUser.email,
          // Add any other required fields
          createdAt: new Date().toISOString()
        });
      }

      console.log("PIN created successfully");
      setHasPin(true);
      setPinVerified(true);
      // Save PIN verification status to localStorage
      localStorage.setItem('pinVerified', 'true');

      // Add a small delay to ensure state updates before returning
      await new Promise(resolve => setTimeout(resolve, 100));

      return true;
    } catch (error) {
      console.error("Error creating PIN:", error);
      return false;
    }
  };

  // Verify user's PIN
  const verifyPin = async (enteredPin) => {
    if (!currentUser) return false;

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().pin === enteredPin) {
        console.log("PIN verified successfully");
        setPinVerified(true);
        // Save PIN verification status to localStorage
        localStorage.setItem('pinVerified', 'true');

        // Add a small delay to ensure state updates before returning
        await new Promise(resolve => setTimeout(resolve, 100));

        return true;
      } else {
        console.log("PIN verification failed - incorrect PIN");
        return false;
      }
    } catch (error) {
      console.error("Error verifying PIN:", error);
      return false;
    }
  };

  // Reset PIN verification status
  const resetPinVerification = () => {
    setPinVerified(false);
    // Clear PIN verification status from localStorage
    localStorage.removeItem('pinVerified');
  };

  // Check if the current user is an admin
  const isAdmin = () => {
    return currentUser && ADMIN_EMAILS.includes(currentUser.email);
  };

  // Check if user has access to a specific module based on department or admin status
  const hasAccess = (module) => {
    // Admin has access to all modules
    if (isAdmin()) return true;

    // For non-admin users, check department permissions
    if (!userProfile || !userProfile.department) return false;

    const department = userProfile.department;
    if (!departmentAccess[department]) return false;

    return departmentAccess[department][module] === true;
  };

  // Sign out function
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setPinVerified(false);
      setHasPin(false);

      // Clear all auth-related data from storage
      localStorage.removeItem('pinVerified');
      localStorage.removeItem('firebase:authUser:AIzaSyBWE_d3k6Zs9P1XQL-bI2Ywmrkx_DdYKQ8:[DEFAULT]');
      sessionStorage.removeItem('firebase:authUser:AIzaSyBWE_d3k6Zs9P1XQL-bI2Ywmrkx_DdYKQ8:[DEFAULT]');

      console.log("User logged out and all auth data cleared");
      navigate('/signin');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    console.log("Setting up auth state listener");

    // Check if we have a valid session
    const checkSession = () => {
      const authInLocalStorage = localStorage.getItem('firebase:authUser:AIzaSyBWE_d3k6Zs9P1XQL-bI2Ywmrkx_DdYKQ8:[DEFAULT]');
      const authInSessionStorage = sessionStorage.getItem('firebase:authUser:AIzaSyBWE_d3k6Zs9P1XQL-bI2Ywmrkx_DdYKQ8:[DEFAULT]');

      if (!authInLocalStorage && !authInSessionStorage) {
        console.log("No valid auth session found");
        setCurrentUser(null);
        setUserProfile(null);
        setHasPin(false);
        setPinVerified(false);
        localStorage.removeItem('pinVerified');
        setLoading(false);
        return false;
      }
      return true;
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "No user");

      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            // User document exists in Firestore, proceed normally
            const userData = userDoc.data();
            setUserProfile(userData);
            setCurrentUser(user);

            // Explicitly check if user has a PIN
            if (userData.pin) {
              setHasPin(true);

              // Always require PIN verification on fresh login
              // This ensures PIN verification shows on first login
              setPinVerified(false);
              localStorage.removeItem('pinVerified');

              console.log("User has PIN, verification required");
            } else {
              setHasPin(false);
              console.log("User does not have PIN, creation required");
            }
          } else {
            // User document doesn't exist in Firestore - this means the user was deleted from the admin panel
            console.log("User document not found in Firestore. User was likely deleted from admin panel:", user.email);

            // Sign out the user immediately
            await signOut(auth);
            setCurrentUser(null);
            setUserProfile(null);
            setHasPin(false);
            setPinVerified(false);
            localStorage.removeItem('pinVerified');
            console.log("User signed out due to missing Firestore document");

            // Don't set currentUser since we're signing them out
            return;
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setHasPin(false);
          setCurrentUser(user); // Still set the user even if there was an error fetching profile
        }
      } else {
        // Reset states when user logs out
        setCurrentUser(null);
        setUserProfile(null);
        setHasPin(false);
        setPinVerified(false);
        localStorage.removeItem('pinVerified');
      }

      setLoading(false);
    });

    // Set up session check interval
    const sessionCheckInterval = setInterval(checkSession, 5000);

    return () => {
      unsubscribe();
      clearInterval(sessionCheckInterval);
    };
  }, [auth, db]);

  // Value to be provided to consumers
  const value = {
    currentUser,
    userProfile,
    loading,
    hasPin,
    pinVerified,
    checkUserPin,
    createPin,
    verifyPin,
    resetPinVerification,
    hasAccess,
    isAdmin,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
