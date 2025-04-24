// src/components/SignUp.jsx
import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaUserAlt } from "react-icons/fa";
import { BsBoxArrowRight, BsAt, BsFillLockFill, BsPeopleFill } from "react-icons/bs";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import firebaseApp from "../../firebaseConfig"; // Adjust the path to your Firebase config file

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

  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

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
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/; // At least 6 characters, 1 numeric, 1 special character

    if (!firstName || !nameRegex.test(firstName)) {
      setError("First Name is required and must not contain special characters or numbers.");
      return false;
    }
    if (!lastName || !nameRegex.test(lastName)) {
      setError("Last Name is required and must not contain special characters or numbers.");
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
      setError("Password must be at least 6 characters long and include a number and a special character.");
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

    if (!validateFields()) {
      return;
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save additional user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email,
        department,
      });

      setSuccess("Account created successfully!");
      console.log("User registered:", user);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please use a different email.");
      } else {
        setError(err.message);
      }
      console.error("Error during registration:", err);
    }
  };

  return (
    <div>
      <form onSubmit={handleSignUp}>
        <div className="form w-96 md:w-6/12 lg:w-4/12 h-auto block mx-auto my-12">
          <div className="form-box bg-yellowsm/20 flex flex-col items-center font-lato h-full space-y-5 py-5 min-w-0 rounded-3xl shadow-2xl">
            <div className="icon">
              <BsBoxArrowRight size={32} />
            </div>
            <div className="signin text-center">
              <h3 className="text-3xl text-black mb-2">Sign Up</h3>
              <p className="text-[1rem] text-black">
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
              <div className="relative w-full max-w-xs mx-auto mt-4">
                <BsPeopleFill
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                >
                  <option value="">Select Department</option>
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
                  {passwordVisible ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </div>
              </div>
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
                  {confirmPasswordVisible ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-500 text-sm">{success}</p>}
              <div className="text-center">
                <button
                  className="font-lato font-bold mt-4 bg-black py-3 px-5 rounded-lg text-whitesm"
                  type="submit"
                >
                  Continue
                </button>
              </div>
              <div className="w-full text-center">
                <p className="text-black text-[.8rem] font-latrue">
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
    </div>
  );
}

export default SignUp;
