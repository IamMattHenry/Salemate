import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsBoxArrowRight, BsAt, BsFillLockFill } from "react-icons/bs";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import firebaseApp, { auth } from "../../firebaseConfig"; // Import both app and auth
import useModal from "../../hooks/Modal/UseModal"; // Import your custom hook

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const { modal, toggleModal } = useModal(); // Use the custom modal hook
  const navigate = useNavigate();
  const { resetPinVerification } = useAuth();

  const db = getFirestore(firebaseApp);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // Function to resend verification email
  const resendVerificationEmail = async () => {
    try {
      setIsLoading(true);
      setError("");

      // First, we need to sign in the user to get their user object
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send verification email
      await sendEmailVerification(user, {
        url: window.location.origin + "/signin",
        handleCodeInApp: false,
      });

      setVerificationSent(true);
      toggleModal(); // Show success modal
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else {
        setError("Failed to send verification email. Please try again.");
      }
      console.error("Error sending verification email:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Reset PIN verification status before login
      resetPinVerification();

      // Clear any existing auth state
      localStorage.removeItem('firebase:authUser:AIzaSyBWE_d3k6Zs9P1XQL-bI2Ywmrkx_DdYKQ8:[DEFAULT]');
      sessionStorage.removeItem('firebase:authUser:AIzaSyBWE_d3k6Zs9P1XQL-bI2Ywmrkx_DdYKQ8:[DEFAULT]');

      console.log("Attempting to sign in with:", email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Sign in successful, user:", user.uid);

      // Check if email is verified
      if (!user.emailVerified) {
        setError("Please verify your email before signing in. Check your inbox for a verification link.");
        setIsLoading(false);
        return;
      }

      // Get user data to check department
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // Update emailVerified status in Firestore if needed
        if (userDoc.data().emailVerified === false) {
          await updateDoc(userDocRef, {
            emailVerified: true
          });
        }

        console.log("User signed in:", user.email, "Department:", userDoc.data().department);
        // Clear any existing PIN verification status
        localStorage.removeItem('pinVerified');
        // Force PIN verification on next protected page access
        resetPinVerification();
        console.log("PIN verification reset for new login session");

        // Add a small delay before redirecting to ensure auth state is updated
        console.log("Setting up redirect to dashboard...");
        setTimeout(() => {
          console.log("Now redirecting to dashboard...");
          // Use window.location for a full page refresh to ensure clean state
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        console.log("User signed in but no profile found:", user);
        // Clear any existing PIN verification status
        localStorage.removeItem('pinVerified');
        // Force PIN verification on next protected page access
        resetPinVerification();
        console.log("PIN verification reset for new login session");

        // Add a small delay before redirecting to ensure auth state is updated
        console.log("Setting up redirect to dashboard...");
        setTimeout(() => {
          console.log("Now redirecting to dashboard...");
          // Use window.location for a full page refresh to ensure clean state
          window.location.href = "/dashboard";
        }, 1000);
      }
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else {
        setError("Failed to sign in. Please try again.");
      }
      console.error("Error during sign-in:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");

    if (!email) {
      setError("Please enter your email address before resetting your password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toggleModal(); // Open the modal
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else {
        setError("Failed to send password reset email. Please try again.");
      }
      console.error("Error during password reset:", err.message);
    }
  };

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
              {error && (
                <div className="text-red-500 text-[0.9rem] bg-red-50 p-3 rounded-lg">
                  <p>{error}</p>
                  {error.includes("verify your email") && (
                    <button
                      type="button"
                      onClick={resendVerificationEmail}
                      className="mt-2 text-blue-600 underline font-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Resend verification email"}
                    </button>
                  )}
                </div>
              )}
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
                  <p className="text-sm text-gray-600 mb-5">
                    We've sent a new verification link to your email address. Please check your inbox and spam folder.
                  </p>
                </>
              ) : (
                <>
                  <h4 className="font-bold text-lg mb-1">We've sent a reset link to your email address</h4>
                  <p className="text-sm text-gray-600 mb-5">Please check your email account.</p>
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
   </div>
  );
}

export default SignIn;
