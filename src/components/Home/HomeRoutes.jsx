import React from "react";
import { Link } from "react-router-dom";

export const HomeRoutes = () => {
  return (
    <div className="bg-whitesm z-[100] absolute left-1/2 -translate-x-1/2 top-5 block mx-auto rounded-3xl md:w-10/12 shadow-sm shadow-black/50 w-10/12">
      <div className="flex items-center justify-between w-full md:text-lg">
        <Link to="/privacypolicy">
          <button className="font-latrue font-bold hover:bg-yellowsm/30 rounded-3xl transition py-5 px-10">
            Privacy Policy
          </button>
        </Link>
        <Link to="/contact">
          <button className="font-latrue font-bold hover:bg-yellowsm/30 rounded-3xl transition p-5 px-10">
            Contact Us
          </button>
        </Link>
        <Link to="/about">
          <button className="font-latrue font-bold hover:bg-yellowsm/30 rounded-3xl transition p-5 px-10">
            About Us
          </button>
        </Link>
        <Link to="/terms-and-condition">
          <button className="font-latrue font-bold hover:bg-yellowsm/30 rounded-3xl transition p-5 px-10">
            Terms and Condition
          </button>
        </Link>
        <Link to="/features">
          <button className="font-latrue font-bold hover:bg-yellowsm/30 rounded-3xl transition p-5 px-10">
            Features
          </button>
        </Link>
      </div>
    </div>
  );
};
