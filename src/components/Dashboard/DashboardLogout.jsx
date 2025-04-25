import React from "react";
import { CiPower } from "react-icons/ci";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const DashboardLogout = ({ isMinimized }) => {
  const auth = getAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) {
      return; // If the user cancels, do nothing
    }

    try {
      await signOut(auth); // Sign out the user
      console.log("User logged out successfully.");
      navigate("/"); // Redirect to the home page
    } catch (error) {
      console.error("Error during logout:", error.message);
    }
  };

  return (
    <button
      type="button"
      className="flex items-center justify-center p-2 space-x-2 cursor-pointer mb-10"
      onClick={handleLogout} // Attach the logout handler
    >
      <CiPower className="text-2xl text-black" />
      {!isMinimized && (
        <span className="font-lato text-[1.05rem] font-semibold">Logout</span>
      )}
    </button>
  );
};

export default DashboardLogout;