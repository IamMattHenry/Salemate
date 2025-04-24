import React from "react";
import { Link } from "react-router-dom";

export const HomeRoutes = () => {
  return (
    <div className="bg-whitesm block mx-auto rounded-3xl md:w-8/12 py-2 px-3 mt-20 shadow-md shadow-black/50 z-50 mb-7 w-10/12">
      <div className="flex items-center justify-evenly md:text-lg">
        <Link to="/privacypolicy">
          <button className="font-lato font-bold hover:bg-yellowsm/30 rounded-4xl transition py-5 px-10">
            Privacy Policy
          </button>
        </Link>
        <Link to="/contact">
          <button className="font-lato font-bold hover:bg-yellowsm/30 rounded-4xl transition p-5 px-10">
            Contact Us
          </button>
        </Link>
        <Link to="/about">
          <button className="font-lato font-bold hover:bg-yellowsm/30 rounded-4xl transition p-5 px-10">
            About Us
          </button>
        </Link>
        <Link to="/terms-and-condition">
          <button className="font-lato font-bold hover:bg-yellowsm/30 rounded-4xl transition p-5 px-10">
            Terms and Condition
          </button>
        </Link>
        <Link to="/features">
          <button className="font-lato font-bold hover:bg-yellowsm/30 rounded-4xl transition p-5 px-10">
            Features
          </button>
        </Link>
      </div>
    </div>
  );
};
