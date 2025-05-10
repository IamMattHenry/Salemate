import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import firebaseApp, { auth } from '../firebaseConfig';

// Create the context
const AuthContext = createContext();

// Define department access permissions
const departmentAccess = {
  Admin: {
    dashboard: true,
    orders: true,
    analytics: true,
    inventory: true,
    customer: true,
    admin: true
  },
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
  const [emailVerified, setEmailVerified] = useState(false);
  // Initialize pinVerified from sessionStorage if available
  const [pinVerified, setPinVerified] = useState(() => {
    const savedPinStatus = sessionStorage.getItem('pinVerified');
    return savedPinStatus === 'true';
  });
  // Track PIN verification attempts and account lockout - initialize from localStorage if available
  const [pinAttempts, setPinAttempts] = useState(() => {
    const savedAttempts = localStorage.getItem('pinAttempts');
    return savedAttempts ? parseInt(savedAttempts, 10) : 0;
  });
  const [accountLocked, setAccountLocked] = useState(() => {
    const savedLockStatus = localStorage.getItem('accountLocked');
    return savedLockStatus === 'true';
  });
  const [lockoutEndTime, setLockoutEndTime] = useState(() => {
    const savedLockoutTime = localStorage.getItem('lockoutEndTime');
    // Check if the saved lockout time is still in the future
    if (savedLockoutTime) {
      const lockoutEnd = new Date(savedLockoutTime);
      const now = new Date();
      if (lockoutEnd > now) {
        return savedLockoutTime;
      }
    }
    return null;
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
      // Save PIN verification status to sessionStorage
      sessionStorage.setItem('pinVerified', 'true');

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

    // Check if account is currently locked
    if (accountLocked) {
      // Check if lockout period has expired
      if (lockoutEndTime && new Date() >= new Date(lockoutEndTime)) {
        // Lockout period has expired, reset lockout state
        setAccountLocked(false);
        setLockoutEndTime(null);
        setPinAttempts(0);

        // Clear lockout info from localStorage
        localStorage.removeItem('accountLocked');
        localStorage.removeItem('lockoutEndTime');
        localStorage.removeItem('pinAttempts');

        console.log("Account lockout period has expired, allowing new attempts");
      } else {
        // Account is still locked
        console.log("PIN verification failed - account is locked");
        return { success: false, locked: true, remainingTime: lockoutEndTime };
      }
    }

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().pin === enteredPin) {
        console.log("PIN verified successfully");
        setPinVerified(true);
        // Save PIN verification status to sessionStorage
        sessionStorage.setItem('pinVerified', 'true');

        // Reset PIN attempts on successful verification
        setPinAttempts(0);
        localStorage.removeItem('pinAttempts');
        localStorage.removeItem('accountLocked');
        localStorage.removeItem('lockoutEndTime');

        // Add a small delay to ensure state updates before returning
        await new Promise(resolve => setTimeout(resolve, 100));

        return { success: true };
      } else {
        console.log("PIN verification failed - incorrect PIN");

        // Increment PIN attempts
        const newAttempts = pinAttempts + 1;
        setPinAttempts(newAttempts);
        // Save to localStorage
        localStorage.setItem('pinAttempts', newAttempts.toString());

        console.log(`Failed PIN attempt ${newAttempts} of 5`);

        // Check if max attempts reached (5)
        if (newAttempts >= 5) {
          // Lock the account for 1 minute
          const lockoutEnd = new Date();
          lockoutEnd.setMinutes(lockoutEnd.getMinutes() + 1); // 1 minute lockout

          setAccountLocked(true);
          setLockoutEndTime(lockoutEnd.toISOString());

          // Save lockout info to localStorage
          localStorage.setItem('accountLocked', 'true');
          localStorage.setItem('lockoutEndTime', lockoutEnd.toISOString());

          console.log(`Account locked until ${lockoutEnd.toLocaleTimeString()}`);

          return {
            success: false,
            locked: true,
            remainingTime: lockoutEnd.toISOString(),
            maxAttemptsReached: true
          };
        }

        return {
          success: false,
          locked: false,
          attempts: newAttempts,
          remainingAttempts: 5 - newAttempts
        };
      }
    } catch (error) {
      console.error("Error verifying PIN:", error);
      return { success: false, error: error.message };
    }
  };

  // Reset PIN verification status
  const resetPinVerification = () => {
    setPinVerified(false);
    // Clear PIN verification status from sessionStorage
    sessionStorage.removeItem('pinVerified');
    // Also reset PIN attempts and lockout status
    setPinAttempts(0);
    setAccountLocked(false);
    setLockoutEndTime(null);
    // Clear all PIN-related localStorage items
    localStorage.removeItem('pinAttempts');
    localStorage.removeItem('accountLocked');
    localStorage.removeItem('lockoutEndTime');
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

    // If the user's department is set to "Admin", they have full access
    if (userProfile.department === "Admin") return true;

    const department = userProfile.department;
    if (!departmentAccess[department]) return false;

    return departmentAccess[department][module] === true;
  };

  // Sign out function - use useCallback to prevent recreation on each render
  const logout = useCallback(async () => {
    try {
      // Get the API key from the firebaseConfig
      const apiKey = "AIzaSyDo2u1X6qkJkfc9VLgrhZTx4Y-TjKiOSi0";

      // Use the correct API key for the storage key
      const storageKey = `firebase:authUser:${apiKey}:[DEFAULT]`;

      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setPinVerified(false);
      setHasPin(false);

      // Clear all auth-related data from storage
      sessionStorage.removeItem('pinVerified');
      localStorage.removeItem('pinAttempts');
      localStorage.removeItem('accountLocked');
      localStorage.removeItem('lockoutEndTime');
      localStorage.removeItem('sessionActive');
      localStorage.removeItem('lastPing');
      localStorage.removeItem('forceLogout');
      localStorage.removeItem(storageKey);
      sessionStorage.removeItem(storageKey);

      // Only log in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log("User logged out and all auth data cleared");
      }

      navigate('/signin');
    } catch (error) {
      console.error("Error signing out:", error);
      // Try to navigate anyway
      navigate('/signin');
    }
  }, [navigate]); // Only depends on navigate

  // Check if lockout period has expired on component mount
  useEffect(() => {
    if (accountLocked && lockoutEndTime) {
      const now = new Date();
      const lockoutEnd = new Date(lockoutEndTime);

      if (now >= lockoutEnd) {
        // Lockout period has expired, reset lockout state
        setAccountLocked(false);
        setLockoutEndTime(null);
        setPinAttempts(0);

        // Clear lockout info from localStorage
        localStorage.removeItem('accountLocked');
        localStorage.removeItem('lockoutEndTime');
        localStorage.removeItem('pinAttempts');

        console.log("Account lockout period has expired on component mount, allowing new attempts");
      }
    }
  }, [accountLocked, lockoutEndTime]);

  // Set up session tracking for auto-logout when page is closed
  useEffect(() => {
    if (currentUser) {
      // Set a flag indicating the user is logged in
      localStorage.setItem('sessionActive', 'true');

      // Set initial ping time
      localStorage.setItem('lastPing', new Date().toISOString());

      // Set up a ping mechanism to indicate the app is still running
      // Use a more frequent interval for better detection of tab switching vs page closing
      const pingInterval = setInterval(() => {
        localStorage.setItem('lastPing', new Date().toISOString());
      }, 1000); // Update every 1 second for more accurate tracking

      // We'll use a combination of events to detect actual page close vs tab switching
      // This variable tracks if we're just switching tabs or actually closing the page
      let isClosing = false;

      // Add event listener for beforeunload to handle page close
      const handleBeforeUnload = () => {
        // When the page is closed, log the user out automatically
        // This prevents security issues with users not properly logging out
        isClosing = true;
        localStorage.setItem('forceLogout', 'true');
        localStorage.setItem('lastPing', new Date().toISOString());
      };

      // When visibility changes, check if it's a page close or just tab switching
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          // Start a timer - if the page becomes visible again before the timer completes,
          // it was just a tab switch, not a page close
          setTimeout(() => {
            // Only log out if the page is still hidden after the timeout
            // and we detected a beforeunload event (actual page close)
            if (document.visibilityState === 'hidden' && isClosing) {
              localStorage.setItem('forceLogout', 'true');
            }
          }, 500); // Short timeout to differentiate between tab switch and page close
        } else if (document.visibilityState === 'visible') {
          // User returned to the page, reset the closing flag
          isClosing = false;
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        clearInterval(pingInterval);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        // Clear any potential logout flags when component unmounts normally
        localStorage.removeItem('forceLogout');
      };
    }
  }, [currentUser]);

  // Function to check previous session using useCallback
  const checkPreviousSession = useCallback(async () => {
    const sessionActive = localStorage.getItem('sessionActive');
    const lastPing = localStorage.getItem('lastPing');
    const forceLogout = localStorage.getItem('forceLogout');

    // Check if the page was recently active (within last 3 seconds)
    // This helps distinguish between tab switching and actual page closing
    const now = new Date();
    const lastPingTime = lastPing ? new Date(lastPing) : null;
    const recentlyActive = lastPingTime && (now - lastPingTime < 3000); // 3 seconds

    // Check if we have a current user from Firebase Auth
    const currentAuthUser = auth.currentUser;

    // If we have a user but email is not verified, force logout
    if (currentAuthUser && !currentAuthUser.emailVerified) {
      console.log("Found user with unverified email on session check, forcing logout");

      // Clear all auth-related data
      const apiKey = "AIzaSyDo2u1X6qkJkfc9VLgrhZTx4Y-TjKiOSi0";
      const storageKey = `firebase:authUser:${apiKey}:[DEFAULT]`;
      localStorage.removeItem(storageKey);
      sessionStorage.removeItem(storageKey);
      localStorage.removeItem('pinVerified');
      localStorage.removeItem('pinAttempts');
      localStorage.removeItem('accountLocked');
      localStorage.removeItem('lockoutEndTime');
      localStorage.removeItem('sessionActive');
      localStorage.removeItem('lastPing');
      localStorage.removeItem('forceLogout');

      // Force logout
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setHasPin(false);
      setPinVerified(false);
      setPinAttempts(0);
      setAccountLocked(false);
      setLockoutEndTime(null);
      setEmailVerified(false);
      setLoading(false);
      return;
    }

    // If force logout flag is set AND the page hasn't been active recently, handle it
    if (forceLogout === 'true' && !recentlyActive) {
      // Only log in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log("Force logout flag detected from previous session");
      }
      localStorage.removeItem('forceLogout');

      // Clear all auth-related data regardless of current user state
      const apiKey = "AIzaSyDo2u1X6qkJkfc9VLgrhZTx4Y-TjKiOSi0";
      const storageKey = `firebase:authUser:${apiKey}:[DEFAULT]`;
      localStorage.removeItem(storageKey);
      sessionStorage.removeItem(storageKey);
      localStorage.removeItem('pinVerified');
      localStorage.removeItem('pinAttempts');
      localStorage.removeItem('accountLocked');
      localStorage.removeItem('lockoutEndTime');
      localStorage.removeItem('sessionActive');
      localStorage.removeItem('lastPing');

      // If user is logged in, force logout
      if (currentUser) {
        await logout();
      }
      return;
    } else if (forceLogout === 'true' && recentlyActive) {
      // If the page was recently active, this was likely just a tab switch
      // Clear the force logout flag but don't log out
      localStorage.removeItem('forceLogout');
    }

    if (sessionActive === 'true' && lastPing) {
      // We already have lastPingTime from above
      const timeDiff = now - lastPingTime;

      // If the last ping was more than 10 minutes ago, the session was likely inactive for a long time
      if (timeDiff > 600000) { // 10 minutes in milliseconds
        console.log("Detected long inactivity period, clearing session data");

        // Clear all auth-related data
        sessionStorage.removeItem('pinVerified');
        localStorage.removeItem('pinAttempts');
        localStorage.removeItem('accountLocked');
        localStorage.removeItem('lockoutEndTime');
        localStorage.removeItem('sessionActive');
        localStorage.removeItem('lastPing');

        // If user is logged in, force logout
        if (currentUser) {
          await logout();
          return;
        }
      }
    }

    // Reset the session tracking for the new session
    localStorage.setItem('sessionActive', 'true');
    localStorage.setItem('lastPing', new Date().toISOString());
  }, [currentUser, logout]);

  // Check if the previous session was terminated abnormally (page closed)
  useEffect(() => {
    // Check for abnormal termination when the component mounts
    checkPreviousSession();

    // Include checkPreviousSession in the dependency array
    // It won't cause re-runs because it's memoized with useCallback
  }, [checkPreviousSession]);

  // Session check function using useCallback to maintain reference
  const checkSession = useCallback(async () => {
    // Check if force logout flag is set (from page close or visibility change)
    const forceLogout = localStorage.getItem('forceLogout') === 'true';

    // Check if the page was recently active (within last 2 seconds)
    // This helps distinguish between tab switching and actual page closing
    const lastPing = localStorage.getItem('lastPing');
    const now = new Date();
    const lastPingTime = lastPing ? new Date(lastPing) : null;
    const recentlyActive = lastPingTime && (now - lastPingTime < 2000); // 2 seconds

    // Check if we have a current user from Firebase Auth
    const currentAuthUser = auth.currentUser;

    // If we have a user but email is not verified, force logout
    if (currentAuthUser && !currentAuthUser.emailVerified) {
      console.log("Found user with unverified email during session check, forcing logout");

      // Clear all auth-related data
      const apiKey = "AIzaSyDo2u1X6qkJkfc9VLgrhZTx4Y-TjKiOSi0";
      const storageKey = `firebase:authUser:${apiKey}:[DEFAULT]`;
      localStorage.removeItem(storageKey);
      sessionStorage.removeItem(storageKey);
      localStorage.removeItem('pinVerified');
      localStorage.removeItem('pinAttempts');
      localStorage.removeItem('accountLocked');
      localStorage.removeItem('lockoutEndTime');
      localStorage.removeItem('sessionActive');
      localStorage.removeItem('lastPing');
      localStorage.removeItem('forceLogout');

      // Force logout
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setHasPin(false);
      setPinVerified(false);
      setPinAttempts(0);
      setAccountLocked(false);
      setLockoutEndTime(null);
      setEmailVerified(false);
      setLoading(false);
      return false;
    }

    // Only log out if force logout flag is set AND the page hasn't been active recently
    // This prevents logout during tab switching
    if (forceLogout && currentUser && !recentlyActive) {
      // Only log in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log("Force logout flag detected, logging out user");
      }
      // Clear the flag first to prevent infinite loops
      localStorage.removeItem('forceLogout');
      // Perform logout
      await logout();
      return false;
    }

    // Get the API key from the firebaseConfig
    const apiKey = "AIzaSyDo2u1X6qkJkfc9VLgrhZTx4Y-TjKiOSi0";

    // Use the correct API key for the storage key
    const storageKey = `firebase:authUser:${apiKey}:[DEFAULT]`;

    const authInLocalStorage = localStorage.getItem(storageKey);
    const authInSessionStorage = sessionStorage.getItem(storageKey);

    // Update the last ping time to indicate the session is active
    if (authInLocalStorage || authInSessionStorage) {
      localStorage.setItem('lastPing', new Date().toISOString());
      return true;
    }

    // Only if there's no auth data in either storage, consider the session invalid
    if (!authInLocalStorage && !authInSessionStorage) {
      console.log("No valid auth session found");
      setCurrentUser(null);
      setUserProfile(null);
      setHasPin(false);
      setPinVerified(false);
      setPinAttempts(0);
      setAccountLocked(false);
      setLockoutEndTime(null);
      // Clear all PIN-related localStorage items
      localStorage.removeItem('pinVerified');
      localStorage.removeItem('pinAttempts');
      localStorage.removeItem('accountLocked');
      localStorage.removeItem('lockoutEndTime');
      localStorage.removeItem('sessionActive');
      localStorage.removeItem('lastPing');
      localStorage.removeItem('forceLogout');
      setLoading(false);
      return false;
    }
    return true;
  }, [currentUser, logout]);

  // Reference to store the session check interval
  const sessionCheckIntervalRef = useRef(null);

  // Listen for auth state changes - only run once on mount
  useEffect(() => {
    // Only log this message in development to reduce console noise
    if (process.env.NODE_ENV === 'development') {
      console.log("Setting up auth state listener");
    }

    const handleAuthStateChange = async (user) => {
      // Only log this message in development to reduce console noise
      if (process.env.NODE_ENV === 'development') {
        console.log("Auth state changed:", user ? "User logged in" : "No user");
      }

      if (user) {
        try {
          // First check if email is verified - this is critical for security
          if (!user.emailVerified) {
            console.log("User logged in but email not verified, signing out");

            // Sign out the user immediately
            await signOut(auth);

            // Reset all auth states
            setCurrentUser(null);
            setUserProfile(null);
            setHasPin(false);
            setPinVerified(false);
            setPinAttempts(0);
            setAccountLocked(false);
            setLockoutEndTime(null);
            setEmailVerified(false);

            // Clear all auth-related localStorage items
            const apiKey = "AIzaSyDo2u1X6qkJkfc9VLgrhZTx4Y-TjKiOSi0";
            const storageKey = `firebase:authUser:${apiKey}:[DEFAULT]`;
            localStorage.removeItem(storageKey);
            sessionStorage.removeItem(storageKey);
            localStorage.removeItem('pinVerified');
            localStorage.removeItem('pinAttempts');
            localStorage.removeItem('accountLocked');
            localStorage.removeItem('lockoutEndTime');
            localStorage.removeItem('sessionActive');
            localStorage.removeItem('lastPing');

            setLoading(false);
            return;
          }

          // If email is verified, proceed with normal authentication
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            // User document exists in Firestore, proceed normally
            const userData = userDoc.data();
            setUserProfile(userData);
            setCurrentUser(user);

            // Set email verified state
            setEmailVerified(user.emailVerified);

            // Update Firestore with the latest email verification status from Firebase Auth
            if (userData.emailVerified !== user.emailVerified) {
              await updateDoc(userDocRef, {
                emailVerified: user.emailVerified
              });
              console.log("Updated email verification status in Firestore");
            }

            // Explicitly check if user has a PIN
            if (userData.pin) {
              setHasPin(true);

              // Check if PIN verification is already done in this session
              const isPinVerified = sessionStorage.getItem('pinVerified') === 'true';
              if (!isPinVerified) {
                setPinVerified(false);
                // Only log this message in development to reduce console noise
                if (process.env.NODE_ENV === 'development') {
                  console.log("User has PIN, verification required");
                }
              } else {
                setPinVerified(true);
              }
            } else {
              setHasPin(false);
              // Only log this message in development to reduce console noise
              if (process.env.NODE_ENV === 'development') {
                console.log("User does not have PIN, creation required");
              }
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
            setPinAttempts(0);
            setAccountLocked(false);
            setLockoutEndTime(null);
            // Clear all PIN-related localStorage items
            localStorage.removeItem('pinVerified');
            localStorage.removeItem('pinAttempts');
            localStorage.removeItem('accountLocked');
            localStorage.removeItem('lockoutEndTime');
            localStorage.removeItem('sessionActive');
            localStorage.removeItem('lastPing');
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
        setPinAttempts(0);
        setAccountLocked(false);
        setLockoutEndTime(null);
        // Clear all PIN-related localStorage items
        localStorage.removeItem('pinVerified');
        localStorage.removeItem('pinAttempts');
        localStorage.removeItem('accountLocked');
        localStorage.removeItem('lockoutEndTime');
        localStorage.removeItem('sessionActive');
        localStorage.removeItem('lastPing');
      }

      setLoading(false);
    };

    // Set up the auth state listener
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);

    // Initial session check
    checkSession();

    // Set up session check interval
    sessionCheckIntervalRef.current = setInterval(checkSession, 5000);

    // Cleanup function
    return () => {
      unsubscribe();
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
    };
  }, [auth, db, checkSession]); // Include checkSession in dependencies

  // Value to be provided to consumers
  const value = {
    currentUser,
    userProfile,
    loading,
    hasPin,
    pinVerified,
    pinAttempts,
    accountLocked,
    lockoutEndTime,
    emailVerified,
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
