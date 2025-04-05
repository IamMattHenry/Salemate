// src/components/SignIn.jsx
import React from "react";

function SignIn() {
  const togglePasswordVisibility = () => {
    const passwordInput = document.getElementById("password");
    const toggleIcon = document.getElementById("togglePassword");
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleIcon.innerHTML = "<path d='M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0'/> <path d='M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7'/>";
    } else {
      passwordInput.type = "password";
      toggleIcon.innerHTML = "<path d='m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z'/><path d='M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z'/>"
    }
  };

  return (
    <div>
      <form>
        <div className="form w-96 md:w-6/12 lg:w-4/12 h-auto block mx-auto my-12">
          <div className="form-box bg-yellowb flex flex-col items-center font-lato h-full space-y-5 py-5 min-w-0 rounded-3xl shadow-2xl">
            <div className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-box-arrow-in-right" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z"/>
                <path fillRule="evenodd" d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
              </svg>
            </div>
            <div className="signin text-center">
              <h3 className="text-3xl text-black mb-2">Sign In</h3>
              <p className="text-sm text-black">Make sure to create your account first before signing in</p>
            </div>
            <div className="signin-inp space-y-3">
              <div className="relative w-full max-w-xs mx-auto">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                </svg>
                <input 
                  type="text" 
                  placeholder="Username"
                  className="pl-10 pr-4 py-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                />
              </div>
              <div className="relative w-full max-w-xs mx-auto">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 2a4 4 0 0 1 4 4v3h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h1V6a4 4 0 0 1 4-4zm-3 7V6a3 3 0 1 1 6 0v3z"/>
                </svg>
                <input 
                  id="password" 
                  type="password" 
                  placeholder="Password"
                  className="pl-10 pr-10 py-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                />
                <svg 
                  id="togglePassword" 
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500" 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  fill="currentColor" 
                  viewBox="0 0 16 16"
                  onClick={togglePasswordVisibility}
                >
                  <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z"/>
                  <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/>
                </svg>
              </div>            
              <div className="w-full text-right">
                <a className="self-end text-sm font-lato underline" href="/">Forgot Password?</a>
              </div>
              <div className="text-center">
                <button className="font-lato font-bold mt-4 bg-black py-3 px-5 rounded-lg text-whitesm cursor-pointer" type="submit">
                  Sign In
                </button>
              </div>
              <div className="w-full text-center">
                <p className="text-black text-sm font-lato">Don't have an account yet? <a className="text-sm font-lato underline cursor-pointer" href="/signup" target="_self">Sign Up</a></p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SignIn;