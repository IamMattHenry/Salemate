import React from "react";

function Footer() {
  return (
    <div>
      <div className="w-full text-center">
        <div className="flex items-center w-full justify-center text-[2rem] mt-40">
          <a href="/" className="space-x-3 text-stone-800">
            <span
              className="font-redacted font-bold">
              S
            </span>
            <span
              className="font-quicksand font-black">
              salemate
            </span>
          </a>
        </div>
        
        <hr className="h-0.5 my-7 w-full mx-auto bg-gray-700 border-0 rounded-lg dark:bg-400 opacity-10"></hr>
        <div className="flex text-[17px] font-lato text-xl text-center justify-center gap-40">
          <h2>
            <a href="/contact">Contact Us</a>
          </h2>
          <h2>
            <a href="/privacypolicy">Privacy Policy</a>
          </h2>
          <h2>
            <a href="/about">About Us</a>
          </h2>
          <h2>
            <a href="/terms-and-condition">Terms and Conditions</a>
          </h2>
          <h2>
            <a href="/features">Features</a>
          </h2>
        </div>
        <hr className="h-0.5 my-7 w-full mx-auto bg-gray-700 border-0 rounded-lg dark:bg-400 opacity-10"></hr>
        <p className="mt-3 font-lato text-gray-600 text-sm pb-10 pt-5">
          Copyright &copy; 2025 Salemate. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}

export default Footer;
