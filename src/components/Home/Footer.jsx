import React from "react";

function Footer() {
  return (
    <div className="w-full px-4 md:px-12 lg:px-24 mt-50">
      <div className="text-center">
        <a href="/" className="flex justify-center">
          <img
            className="w-[180px] md:w-[200px]"
            src="/salemate.png"
            alt="logo"
          />
        </a>

        <hr className="h-0.5 my-7 w-full max-w-screen-lg mx-auto bg-gray-700 border-0 rounded-lg opacity-10" />

        <div className="flex flex-wrap justify-center text-[16px] md:text-[17px] gap-6 md:gap-10 lg:gap-20 font-lato">
          <a href="/contact">Contact Us</a>
          <a href="/privacypolicy">Privacy Policy</a>
          <a href="/about">About Us</a>
          <a href="/terms-and-condition">Terms and Conditions</a>
          <a href="/features">Features</a>
        </div>

        <hr className="h-0.5 my-7 w-full max-w-screen-lg mx-auto bg-gray-700 border-0 rounded-lg opacity-10" />

        <p className="mt-3 font-lato text-gray-600 text-sm pb-10 pt-5">
          Copyright &copy; 2025 Salemate. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}

export default Footer;
