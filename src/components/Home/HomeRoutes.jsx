import React from "react";
import { Link } from "react-router-dom";

export const HomeRoutes = () => {
  return (
    <div className="bg-white block rounded-3xl md:w-250 md:h-18  py-2 mt-5 shadow-md shadow-black/50 z-50 -mb-10">
      <div className="flex items-center justify-evenly md:text-[21px]">
        <Link to="/privacypolicy">
          <button className="font-lato font-semibold hover:bg-[rgba(255,207,80,0.3)] hover:shadow-[inset_0_3px_5px_rgba(0,0,0,0.1)] text-black rounded-2xl transition pt-3 -ml-10">
            Privacy Policy
          </button>
        </Link>
        <Link to="/contact">
          <button className="font-lato font-semibold hover:bg-[rgba(255,207,80,0.3)] hover:shadow-[inset_0_3px_5px_rgba(0,0,0,0.1)] text-black rounded-2xl transition pt-3">
            Contact Us
          </button>
        </Link>
        <Link to="/about">
          <button className="font-lato font-semibold  hover:bg-[rgba(255,207,80,0.3)] hover:shadow-[inset_0_3px_5px_rgba(0,0,0,0.1)] text-black rounded-2xl transition pt-3">
            About Us
          </button>
        </Link>
        <Link to="/terms-and-condition">
          <button className="font-lato font-semibold  hover:bg-[rgba(255,207,80,0.3)] hover:shadow-[inset_0_3px_5px_rgba(0,0,0,0.1)] text-black rounded-2xl transition pt-3">
            Terms and Condition
          </button>
        </Link>
        <Link to="/features">
          <button className="font-lato font-semibold  hover:bg-[rgba(255,207,80,0.3)] hover:shadow-[inset_0_3px_5px_rgba(0,0,0,0.1)] text-black rounded-2xl transition pt-3 -mr-10">
            Features
          </button>
        </Link>
      </div>
    </div>
  );
};
