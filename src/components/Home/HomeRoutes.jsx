import React from "react";
import { Link } from "react-router-dom";

export const HomeRoutes = ({className = ""}) => {
  return (
    <div className={`bg-white z-[100] absolute left-1/2 -translate-x-1/2 top-5 block mx-auto rounded-3xl md:w-10/12 shadow-feat w-10/12 ${className}`}>
      <div className="flex items-center justify-between w-full md:text-xl">
        <Link to="/privacypolicy">
          <button className="font-lato font-semibold hover:bg-yellowsm/30 rounded-2xl transition py-5 px-10">
            Privacy Policy
          </button>
        </Link>
        <Link to="/contact">
          <button className="font-lato font-semibold hover:bg-yellowsm/30 rounded-2xl transition p-5 px-10">
            Contact Us
          </button>
        </Link>
        <Link to="/about">
          <button className="font-lato font-semibold hover:bg-yellowsm/30 rounded-2xl transition p-5 px-10">
            About Us
          </button>
        </Link>
        <Link to="/terms-and-condition">
          <button className="font-lato font-semibold hover:bg-yellowsm/30 rounded-2xl transition p-5 px-10">
            Terms and Condition
          </button>
        </Link>
        <Link to="/features">
          <button className="font-lato font-semibold hover:bg-yellowsm/30 rounded-2xl transition p-5 px-10">
            Features
          </button>
        </Link>
      </div>
    </div>
  );
};
