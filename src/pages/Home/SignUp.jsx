// src/components/SignUp.jsx
import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaUserAlt, FaCheck, FaTimes } from "react-icons/fa";
import {
  BsBoxArrowRight,
  BsAt,
  BsFillLockFill,
  BsPeopleFill,
  BsCheckCircleFill,
} from "react-icons/bs";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import firebaseApp, { auth } from "../../firebaseConfig"; // Import both app and auth
import { useNavigate } from "react-router-dom";
import PostSignupVerificationModal from "../../components/Auth/PostSignupVerificationModal";

function SignUp() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    number: false,
    special: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const navigate = useNavigate();
  // Using the imported auth instance directly
  const db = getFirestore(firebaseApp);

  // Check password requirements as user types
  useEffect(() => {
    if (password) {
      setPasswordRequirements({
        length: password.length >= 6,
        number: /\d/.test(password),
        special: /[!@#$%^&*]/.test(password)
      });
    } else {
      setPasswordRequirements({
        length: false,
        number: false,
        special: false
      });
    }
  }, [password]);

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setPasswordVisible(!passwordVisible);
    } else if (field === "confirmPassword") {
      setConfirmPasswordVisible(!confirmPasswordVisible);
    }
  };

  const validateFields = () => {
    const nameRegex = /^[a-zA-Z\s]+$/; // Allow letters and spaces
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Valid email format
    const passwordRegex =
      /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/; // At least 6 characters, 1 numeric, 1 special character

    if (!firstName || !nameRegex.test(firstName)) {
      setError(
        "First Name is required and must not contain special characters or numbers."
      );
      return false;
    }
    if (!lastName || !nameRegex.test(lastName)) {
      setError(
        "Last Name is required and must not contain special characters or numbers."
      );
      return false;
    }
    if (!email || !emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!department) {
      setError("Please select a department.");
      return false;
    }
    if (!password || !passwordRegex.test(password)) {
      setError(
        "Password must be at least 6 characters long and include a number and a special character."
      );
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!validateFields()) {
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting to create user with email:", email);

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log("User created successfully with UID:", user.uid);

      // Send email verification
      await sendEmailVerification(user, {
        url: window.location.origin + "/signin", // Redirect URL after verification
        handleCodeInApp: false,
      });

      // Save additional user data to Firestore
      try {
        await setDoc(doc(db, "users", user.uid), {
          firstName,
          lastName,
          email,
          department,
          emailVerified: false, // Track email verification status
          createdAt: new Date().toISOString(),
          lastSignIn: new Date().toISOString(), // Add last sign-in date
          additionalInfoCompleted: true, // Mark as completed to skip the additional info modal
        });
        console.log("User data saved to Firestore successfully");
        setSuccess("Account created successfully! Please verify your email.");
        console.log("User registered:", user);
      } catch (firestoreError) {
        console.error("Error saving user data to Firestore:", firestoreError);
        // Still continue with the registration process even if Firestore save fails
        // This way the user is at least created in Firebase Auth
        setSuccess("Account created but profile data couldn't be saved. Please contact support.");
      }

      // Store the email for the verification modal
      setRegisteredEmail(email);

      // Store user information in localStorage for later use during sign-in
      localStorage.setItem('registeredDepartment', department);
      localStorage.setItem('registeredFirstName', firstName);
      localStorage.setItem('registeredLastName', lastName);
      console.log("Saved user information to localStorage:", { department, firstName, lastName });

      // IMPORTANT: Sign out the user IMMEDIATELY after registration
      // This prevents the auth state listener from detecting a logged-in user with unverified email
      try {
        // Use signOut from Firebase directly to ensure immediate effect
        await signOut(auth);
        console.log("User signed out immediately after registration");

        // Clear any auth data from storage to prevent auto-login
        const apiKey = "AIzaSyDo2u1X6qkJkfc9VLgrhZTx4Y-TjKiOSi0";
        const storageKey = `firebase:authUser:${apiKey}:[DEFAULT]`;
        localStorage.removeItem(storageKey);
        sessionStorage.removeItem(storageKey);
      } catch (error) {
        console.error("Error signing out after registration:", error);
      }

      // Show verification modal with auto-redirect
      setShowVerificationModal(true);
      console.log("Showing verification modal with auto-redirect to sign-in page");

      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setDepartment("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Firebase error code:", err.code);
      console.error("Firebase error message:", err.message);

      if (err.code === "auth/email-already-in-use") {
        setError(
          "This email is already registered. Please use a different email or sign in with your existing account."
        );
        console.error("Error during registration: Email already in use");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
        console.error("Error during registration: Invalid email format");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please choose a stronger password.");
        console.error("Error during registration: Weak password");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection and try again.");
        console.error("Error during registration: Network request failed");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
        console.error("Error during registration: Too many requests");
      } else if (err.code === "auth/permission-denied" || err.message.includes("permission") || err.message.includes("insufficient")) {
        setError("Registration failed: Missing or insufficient permissions. Please contact the administrator.");
        console.error("Error during registration: Permission denied", err);
      } else {
        setError(`Registration failed: ${err.message}`);
        console.error("Error during registration:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSignUp}>
        <div className="w-96 md:w-6/12 lg:w-4/12 h-auto block mx-auto">
          <div className="form-box bg-yellowsm/10 flex flex-col items-center font-latrue h-full space-y-5 min-w-0 rounded-3xl shadow-lg py-12">
            <div className="signin text-center">
              <h3 className="text-3xl text-black mb-2 font-bold">Sign Up</h3>
              <p className="text-[1rem] text-black font-light">
                Please provide your information below
              </p>
            </div>
            <div className="signin-inp space-y-3">
              <div className="relative w-full max-w-xs mx-auto">
                <FaUserAlt
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                />
              </div>
              <div className="relative w-full max-w-xs mx-auto">
                <FaUserAlt
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                />
              </div>
              <div className="relative w-full max-w-xs mx-auto">
                <BsAt
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                />
              </div>
              <div className="relative w-full max-w-xs mx-auto">
                <BsPeopleFill
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className={`py-3 pl-[2.2rem] border-r-8 border-transparent outline outline-transparent w-full rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white ${
                    department === '' ? 'text-gray-500' : 'text-black'
                  }`}
                >
                  <option value="" disabled>
                    Select Department
                  </option>
                  <option value="Financial">Financial</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Production">Production</option>
                </select>
              </div>
              <div className="relative w-full max-w-xs mx-auto">
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
                  className="pl-10 pr-12 py-2 w-full rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                />
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                  onClick={() => togglePasswordVisibility("password")}
                >
                  {passwordVisible ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </div>
              </div>

              {/* Password requirements */}
              {password.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg w-full max-w-xs mx-auto">
                  <p className="text-sm font-medium text-gray-700 mb-2">Password requirements:</p>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center">
                      {passwordRequirements.length ? (
                        <FaCheck className="text-green-500 mr-2" />
                      ) : (
                        <FaTimes className="text-red-500 mr-2" />
                      )}
                      <span className={passwordRequirements.length ? "text-green-700" : "text-gray-600"}>
                        At least 6 characters
                      </span>
                    </li>
                    <li className="flex items-center">
                      {passwordRequirements.number ? (
                        <FaCheck className="text-green-500 mr-2" />
                      ) : (
                        <FaTimes className="text-red-500 mr-2" />
                      )}
                      <span className={passwordRequirements.number ? "text-green-700" : "text-gray-600"}>
                        At least 1 number
                      </span>
                    </li>
                    <li className="flex items-center">
                      {passwordRequirements.special ? (
                        <FaCheck className="text-green-500 mr-2" />
                      ) : (
                        <FaTimes className="text-red-500 mr-2" />
                      )}
                      <span className={passwordRequirements.special ? "text-green-700" : "text-gray-600"}>
                        At least 1 special character (!@#$%^&*)
                      </span>
                    </li>
                  </ul>
                </div>
              )}
              <div className="relative w-full max-w-xs mx-auto">
                <BsFillLockFill
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <input
                  id="password-2"
                  type={confirmPasswordVisible ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-12 py-2 w-80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                />
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                >
                  {confirmPasswordVisible ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-500 text-sm">{success}</p>}
              <div className="text-center">
                <button
                  className="font-latrue font-bold mt-7 bg-black py-3 px-10 rounded-2xl text-whitesm cursor-pointer flex items-center justify-center mx-auto"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
              <div className="w-full text-center">
                <p className="text-black text-[.9rem] font-latrue">
                  Already had an account?{" "}
                  <a
                    className="text-[.8rem] font-latrue underline"
                    href="/signin"
                    target="_self"
                  >
                    Sign In
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Email Verification Modal */}
      <PostSignupVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        email={registeredEmail}
      />
    </div>
  );
}

export default SignUp;
