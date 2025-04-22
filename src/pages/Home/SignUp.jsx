// src/components/SignUp.jsx
import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaUserAlt } from "react-icons/fa";
import {
  BsBoxArrowRight,
  BsAt,
  BsFillLockFill,
  BsPeopleFill,
} from "react-icons/bs";

function SignUp() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setPasswordVisible(!passwordVisible);
    } else if (field === "confirmPassword") {
      setConfirmPasswordVisible(!confirmPasswordVisible);
    }
  };

  return (
    <div>
      <form>
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
                  className="pl-10 pr-4 py-2 w-full rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                />
              </div>
              <div className="relative w-full max-w-xs mx-auto mt-4">
                <BsPeopleFill
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Department"
                  className="pl-10 pr-4 py-2 w-full rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                />
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
              <div className="relative w-full max-w-xs mx-auto">
                <BsFillLockFill
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <input
                  id="password-2"
                  type={confirmPasswordVisible ? "text" : "password"}
                  placeholder="Confirm Password"
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
