import React from "react";
import { Link } from "react-router-dom";

export const HomeRoutes = () => {
  return (
    <div className="bg-whitesm z-[100] absolute left-1/2 -translate-x-1/2 top-5 block mx-auto rounded-3xl md:w-8/12 py-2 px-3 shadow-md shadow-black/50 w-10/12">
      <div className="flex items-center justify-evenly md:text-lg">
        <Link to="/privacypolicy">
          <button className="font-lato font-bold hover:bg-peachsm rounded-2xl transition p-3">
            Privacy Policy
          </button>
        </Link>
        <Link to="/contact">
          <button className="font-lato font-bold hover:bg-peachsm rounded-2xl transition p-3">
            Contact Us
          </button>
        </Link>
        <Link to="/about">
          <button className="font-lato font-bold hover:bg-peachsm rounded-2xl transition p-3">
            About Us
          </button>
        </Link>
        <Link to="/terms-and-condition">
          <button className="font-lato font-bold hover:bg-peachsm rounded-2xl transition p-3">
            Terms and Condition
          </button>
        </Link>
        <Link to="/features">
          <button className="font-lato font-bold hover:bg-peachsm rounded-2xl transition p-3">
            Features
          </button>
        </Link>
      </div>
    </div>
  );
};
