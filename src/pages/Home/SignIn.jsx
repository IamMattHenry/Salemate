import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsBoxArrowRight, BsAt, BsFillLockFill } from "react-icons/bs";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import firebaseApp from "../../firebaseConfig"; // Adjust the path to your Firebase config file

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const auth = getAuth(firebaseApp);

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setPasswordVisible(!passwordVisible);
    } else if (field === "confirmPassword") {
      setConfirmPasswordVisible(!confirmPasswordVisible);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Sign in the user with email and password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log("User signed in:", user);
      navigate("/dashboard"); // Redirect to the dashboard after successful login
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else {
        setError("Failed to sign in. Please try again.");
      }
      console.error("Error during sign-in:", err.message);
    }
  };

  return (
    <div>
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
                  type={confirmPasswordVisible ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 py-2 w-84 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                  required
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
              {error && <p className="text-red-500 text-[0.9rem]`">{error}</p>}
              <div className="w-full text-right">
                <a className="self-end text-[0.9rem] font-latrue underline" href="/">
                  Forgot Password?
                </a>
              </div>
              <div className="text-center">
                <button
                  className="font-latrue font-bold mt-4 bg-black py-3 px-12 rounded-2xl text-whitesm cursor-pointer"
                  type="submit"
                >
                  Sign In
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
    </div>
  );
}

export default SignIn;
