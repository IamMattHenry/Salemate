import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { BsAt, BsFillLockFill } from "react-icons/bs";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import firebaseApp, { auth } from "../../firebaseConfig"; // Import both app and auth
import useModal from "../../hooks/Modal/UseModal"; // Import your custom hook
import DisabledAccountModal from "../../components/Auth/DisabledAccountModal"; // Import the disabled account modal
import SignInVerificationReminder from "../../components/Auth/SignInVerificationReminder"; // Import the verification reminder modal
import ForgotPasswordValidationModal from "../../components/Auth/ForgotPasswordValidationModal"; // Import the forgot password validation modal
import IncorrectCredentialsModal from "../../components/Auth/IncorrectCredentialsModal"; // Import the incorrect credentials modal


function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showDisabledModal, setShowDisabledModal] = useState(false);
  const [showVerificationReminder, setShowVerificationReminder] = useState(false);
  const [redirectToDashboard, setRedirectToDashboard] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showIncorrectCredentialsModal, setShowIncorrectCredentialsModal] = useState(false);

  const { modal, toggleModal } = useModal(); // Use the custom modal hook
  const location = useLocation();
  const { resetPinVerification, currentUser } = useAuth();

  // Check for verification reminder parameter
  useEffect(() => {
    // Check if we have a 'verify' query parameter
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('verify') === 'true') {
      // Show the verification reminder modal
      setShowVerificationReminder(true);

      // Remove the query parameter to prevent showing the modal again on refresh
      // This creates a new URL without the query parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [location]);

  // Check if user is already logged in and email is verified
  useEffect(() => {
    const checkUserStatus = async () => {
      if (currentUser) {
        // Only redirect if email is verified
        if (currentUser.emailVerified) {
          console.log("User already logged in with verified email, checking access...");

          try {
            // Get user data to check department
            const db = getFirestore(firebaseApp);
            const userDocRef = doc(db, "users", currentUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const userData = userDoc.data();
              const department = userData.department;

              // Admin users always go to dashboard
              if (department === 'Admin' || ['admin@gmail.com', 'adminadmin@gmail.com', 'salemate186@gmail.com'].includes(currentUser.email)) {
                console.log("Admin user, redirecting to dashboard");
                window.location.href = '/dashboard';
                return;
              }

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

              // Check if department exists and has dashboard access
              if (department && departmentAccess[department] && departmentAccess[department].dashboard) {
                console.log("User has dashboard access, redirecting to dashboard");
                window.location.href = '/dashboard';
                return;
              } else if (department && departmentAccess[department]) {
                // Find first module they have access to
                const modulesToCheck = ['orders', 'inventory', 'customer', 'analytics'];
                for (const module of modulesToCheck) {
                  if (departmentAccess[department][module]) {
                    console.log(`User doesn't have dashboard access, redirecting to ${module}`);
                    window.location.href = `/${module}`;
                    return;
                  }
                }
                // Default to orders if no specific access
                window.location.href = '/orders';
              } else {
                // Default to orders for unknown departments
                console.log("Unknown department, redirecting to orders");
                window.location.href = '/orders';
              }
            } else {
              // No user document, default to orders
              console.log("No user document found, redirecting to orders");
              window.location.href = '/orders';
            }
          } catch (err) {
            console.error("Error checking user access:", err);
            // Default to dashboard on error
            window.location.href = '/dashboard';
          }
        } else {
          console.log("User logged in but email not verified, signing out");
          // Sign out the user to prevent the redirect loop
          try {
            await auth.signOut();
            // Show the verification reminder modal if it's not already visible
            if (!showVerificationReminder) {
              setShowVerificationReminder(true);
            }

          } catch (err) {
            console.error("Error signing out:", err);
          }
        }
      }
    };

    checkUserStatus();
  }, [currentUser, showVerificationReminder]);

  const db = getFirestore(firebaseApp);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // Function to resend verification email (not used directly in this component)
  /*
  const resendVerificationEmail = async () => {
    try {
      setIsLoading(true);

      // First, we need to sign in the user to get their user object
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if account is disabled
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().disabled === true) {
        // Sign out the user immediately
        await auth.signOut();
        // Show the disabled account modal instead of just an error message
        setShowDisabledModal(true);
        setIsLoading(false);
        return;
      }

      // Send verification email
      await sendEmailVerification(user, {
        url: window.location.origin + "/signin",
        handleCodeInApp: false,
      });

      // Sign out the user after sending verification email
      await auth.signOut();

      // Show success modal
      setVerificationSent(true);
      toggleModal();
    } catch (err) {
      console.error("Error sending verification email:", err.message);

      // Show appropriate error modal based on error code
      if (err.code === "auth/wrong-password") {
        setShowIncorrectCredentialsModal(true);
      } else {
        setShowIncorrectCredentialsModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };
  */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Declare user variable for use in nested scopes
    let user;

    console.log("=== SIGN IN ATTEMPT ===");
    console.log("Email:", email);
    console.log("Password length:", password.length);

    // Reset all modal states
    setShowIncorrectCredentialsModal(false);
    setShowVerificationReminder(false);
    setShowDisabledModal(false);
    setShowForgotPasswordModal(false);

    try {
      // Proceed directly with Firebase authentication
      console.log("Attempting Firebase authentication");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Store user in outer scope
      user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        console.log("Email not verified, showing verification modal");
        // Sign out the user immediately
        await auth.signOut();
        // Show the verification reminder modal
        setShowVerificationReminder(true);
        setIsLoading(false);
        return;
      }

      // If we get here, email is verified, so we can proceed with the actual login
      console.log("Email verified, proceeding with login");

      // Reset PIN verification status before login
      resetPinVerification();

      // We don't need to sign in again since we already did it above
      console.log("Sign in successful, user:", user.uid);

      console.log("Email verification status:", user.emailVerified);

      // Get user data to check department and disabled status
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Check if account is disabled
        if (userData.disabled === true) {
          // Sign out the user immediately
          await auth.signOut();
          // Show the disabled account modal instead of just an error message
          setShowDisabledModal(true);
          setIsLoading(false);
          return;
        }

        // Update emailVerified status in Firestore if needed
        if (userData.emailVerified === false) {
          await updateDoc(userDocRef, {
            emailVerified: true
          });
        }

        // Update last sign-in timestamp
        await updateDoc(userDocRef, {
          lastSignIn: new Date().toISOString()
        });

        console.log("User signed in:", user.email, "Department:", userData.department);
        // Clear any existing PIN verification status
        localStorage.removeItem('pinVerified');
        // Force PIN verification on next protected page access
        resetPinVerification();
        console.log("PIN verification reset for new login session");

        // Check if user has access to dashboard, if not redirect to a page they can access
        const department = userData.department;
        const redirectToAppropriateModule = () => {
          // Define the order of modules to check for access
          const modulesToCheck = ['dashboard', 'orders', 'inventory', 'customer', 'analytics'];

          // Check if department exists in departmentAccess
          const departmentExists = department &&
            ['Admin', 'Production', 'Marketing', 'Financial'].includes(department);

          if (!departmentExists) {
            // If department doesn't exist in our access control, default to dashboard
            console.log("Department not found in access control, defaulting to dashboard");
            setRedirectToDashboard(true);
            return;
          }

          // Admin users and users with Admin department always have access to dashboard
          if (department === 'Admin' || ['admin@gmail.com', 'adminadmin@gmail.com', 'salemate186@gmail.com'].includes(user.email)) {
            console.log("Admin user, redirecting to dashboard");
            setRedirectToDashboard(true);
            return;
          }

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

          // Check if user has access to dashboard
          if (departmentAccess[department] && departmentAccess[department].dashboard) {
            console.log("User has access to dashboard, redirecting there");
            setRedirectToDashboard(true);
            return;
          }

          // If not, find the first module they have access to
          for (const module of modulesToCheck) {
            if (departmentAccess[department] && departmentAccess[department][module]) {
              console.log(`User doesn't have dashboard access, redirecting to ${module}`);
              // Use window.location for direct navigation instead of React Router's navigate
              window.location.href = `/${module}`;
              return;
            }
          }

          // If no access to any module, default to orders (most basic access)
          console.log("User has no specific access, defaulting to orders");
          window.location.href = '/orders';
        };

        // Execute redirect immediately without setTimeout
        console.log("Redirecting to appropriate module...");
        redirectToAppropriateModule();
      } else {
        // User document doesn't exist in Firestore, create a basic one
        console.log("User document not found in Firestore. Creating a basic user document.");

        // Create a basic user document with information from localStorage
        const savedDepartment = localStorage.getItem('registeredDepartment') || "Financial";
        const savedFirstName = localStorage.getItem('registeredFirstName') || "";
        const savedLastName = localStorage.getItem('registeredLastName') || "";

        await setDoc(userDocRef, {
          firstName: savedFirstName,
          lastName: savedLastName,
          email: user.email,
          emailVerified: user.emailVerified,
          createdAt: new Date().toISOString(),
          lastSignIn: new Date().toISOString(),
          department: savedDepartment, // Use saved department or default to Financial
          additionalInfoCompleted: true // Mark as completed to skip the additional info modal
        });

        console.log("Basic user document created for:", user.email);

        // For new users, redirect to dashboard
        console.log("New user, redirecting to dashboard");
        setRedirectToDashboard(true);
      }
    } catch (err) {
      console.log("Authentication error code:", err.code);

      // Show the incorrect credentials modal for all authentication errors
      setShowIncorrectCredentialsModal(true);

      console.error("Error during sign-in:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setShowForgotPasswordModal(true);
      return;
    }

    // Reset modal states
    setShowIncorrectCredentialsModal(false);

    try {
      console.log("Proceeding with password reset");

      // If email exists, proceed with password reset
      await sendPasswordResetEmail(auth, email);
      toggleModal(); // Open the modal
    } catch (err) {
      console.log("Password reset error:", err.code);

      // For Firebase errors, show the incorrect credentials modal
      setShowIncorrectCredentialsModal(true);
      console.error("Error during password reset:", err.message);
    }
  };

  // Redirect to dashboard if user is authenticated
  if (redirectToDashboard) {
    console.log("Redirecting to dashboard...");
    return <Navigate to="/dashboard" replace />;
  }

  // Debug modal states
  useEffect(() => {
    console.log("Modal States:", {
      showIncorrectCredentialsModal,
      showVerificationReminder,
      showDisabledModal,
      showForgotPasswordModal
    });
  }, [showIncorrectCredentialsModal, showVerificationReminder, showDisabledModal, showForgotPasswordModal]);

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <div className="w-96 md:w-6/12 lg:w-4/12 block mx-auto h-auto">
          <div className="bg-yellowsm/10 flex flex-col items-center justify-center font-latrue space-y-5 rounded-3xl shadow-lg py-15">
            <div className="signin text-center">
              <h3 className="text-3xl text-black mb-2 font-bold">Sign In</h3>
              <p className="text-[1rem] text-black font-light">
                Make sure to sign up first before signing in.
              </p>
            </div>
            <div className="signin-inp space-y-4 mt-5">
              <div className="relative w-full mx-auto">
                <BsAt
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                  required
                />
              </div>
              <div className="relative w-full mx-auto">
                <BsFillLockFill
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <input
                  id="password"
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 py-2 w-84 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                  required
                />
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                  onClick={togglePasswordVisibility}
                >
                  {passwordVisible ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </div>
              </div>
              {/* Error messages are now shown in the ValidationErrorModal */}
              <div className="w-full text-right">
                <button
                  type="button"
                  className="self-end text-[0.9rem] font-latrue underline"
                  onClick={handleForgotPassword} // Trigger password reset
                >
                  Forgot Password?
                </button>
              </div>
              <div className="text-center">
                <button
                  className="font-latrue font-bold mt-4 bg-black py-3 px-12 rounded-2xl text-whitesm cursor-pointer flex items-center justify-center mx-auto"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>
              <div className="w-full text-center">
                <p className="text-black text-[0.9rem] font-latrue">
                  Don't have an account yet?{" "}
                  <a
                    className="text-[0.9rem] font-latrue underline cursor-pointer"
                    href="/signup"
                    target="_self"
                  >
                    Sign Up
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Modal for either Forgot Password or Email Verification */}
      {modal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/30">
          <div className="bg-white p-6 rounded-3xl shadow-lg w-80 animate-pop-up">
            <div className="text-center">
              <div className="bg-green-500 text-white rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {verificationSent ? (
                <>
                  <h4 className="font-bold text-lg mb-1">Verification Email Sent</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    We've sent a new verification link to <span className="font-semibold">{email}</span>.
                  </p>
                  <div className="bg-blue-50 p-3 rounded-lg mb-4 text-left">
                    <p className="text-sm text-blue-800 font-medium">Important:</p>
                    <ul className="text-sm text-blue-700 list-disc pl-5 mt-1">
                      <li>Check your spam folder if you don't see the email</li>
                      <li>The verification link expires in 24 hours</li>
                      <li>You must verify your email before signing in</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="font-bold text-lg mb-1">Password Reset Email Sent</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    We've sent a password reset link to <span className="font-semibold">{email}</span>.
                  </p>
                  <div className="bg-blue-50 p-3 rounded-lg mb-4 text-left">
                    <p className="text-sm text-blue-800 font-medium">Next steps:</p>
                    <ul className="text-sm text-blue-700 list-disc pl-5 mt-1">
                      <li>Check your inbox and spam folder</li>
                      <li>Click the reset link in the email</li>
                      <li>Create a new password</li>
                      <li>Return to this page to sign in</li>
                    </ul>
                  </div>
                </>
              )}

              <button
                type="button"
                className="bg-green-500 text-white w-full py-2 rounded-full font-medium"
                onClick={() => {
                  toggleModal();
                  setVerificationSent(false);
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disabled Account Modal */}
      <DisabledAccountModal
        isOpen={showDisabledModal}
        onClose={() => setShowDisabledModal(false)}
        email={email}
      />

      {/* Verification Reminder Modal */}
      <SignInVerificationReminder
        isOpen={showVerificationReminder}
        onClose={() => setShowVerificationReminder(false)}
      />

      {/* Forgot Password Validation Modal */}
      <ForgotPasswordValidationModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />

      {/* Incorrect Credentials Modal */}
      <IncorrectCredentialsModal
        isOpen={showIncorrectCredentialsModal}
        onClose={() => setShowIncorrectCredentialsModal(false)}
        email={email}
        onForgotPassword={handleForgotPassword}
      />


   </div>
  );
}

export default SignIn;
