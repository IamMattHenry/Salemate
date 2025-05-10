import React, { useEffect, useState } from "react";
import { BsPersonCircle } from "react-icons/bs";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import {
  MdDashboard,
  MdInventory,
  MdAnalytics,
  MdShoppingCart,
  MdPeople,
  MdAdminPanelSettings
} from "react-icons/md";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import firebaseApp from "../../firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import NotificationSystem from "../common/NotificationSystem";

const DashboardHeader = () => {
  const [lastName, setLastName] = useState(""); // State to store the last name
  const [department, setDepartment] = useState(""); // State to store the department
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const { isAdmin } = useAuth(); // Get the isAdmin function from AuthContext

  // Fetch user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setLastName(userDoc.data().lastName); // Fetch the last name
            setDepartment(userDoc.data().department); // Fetch the department
          } else {
            setError("User data not found.");
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("Failed to fetch user data.");
        } finally {
          setLoading(false);
        }
      } else {
        setError("No user is currently logged in.");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, db]);





  const dateToday = new Date();
  const dateFormat = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = dateToday.toLocaleDateString("en-US", dateFormat);

  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path.includes("inventory")) return "Inventory";
    if (path.includes("dashboard")) return "Dashboard";
    if (path.includes("orders")) return "Order History";
    if (path.includes("analytics")) return "Analytic Report";
    if (path.includes("customer")) return "Customer";
    if (path.includes("admin")) return "User Accounts";
    return "Welcome";
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  // Function to get the appropriate icon based on the current page
  const getPageIcon = () => {
    const path = location.pathname;

    if (path.includes("dashboard")) return <MdDashboard className="text-amber-700 size-5" />;
    if (path.includes("orders")) return <MdShoppingCart className="text-amber-700 size-5" />;
    if (path.includes("analytics")) return <MdAnalytics className="text-amber-700 size-5" />;
    if (path.includes("inventory")) return <MdInventory className="text-amber-700 size-5" />;
    if (path.includes("customer")) return <MdPeople className="text-amber-700 size-5" />;
    if (path.includes("admin")) return <MdAdminPanelSettings className="text-amber-700 size-5" />;

    // Default icon
    return <HiOutlineMenuAlt2 className="text-amber-700 size-5" />;
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 shadow-sm">
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-8 py-4">
        {/* Left side - Title with elegant styling */}
        <div className="flex items-center">
          <button className="mr-5 p-2 rounded-full bg-amber-400/10 hover:bg-amber-400/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400/40">
            {getPageIcon()}
          </button>

          <div className="relative">
            <h1 className="font-lato font-bold text-2xl text-gray-800">
              {getHeaderTitle()}
            </h1>
            <div className="absolute -bottom-1 left-0 h-0.5 w-12 bg-amber-400 rounded-full"></div>
          </div>
        </div>

        {/* Right side - User Info with premium styling */}
        <div className="flex items-center">
          <div className="mr-5 text-right">
            <p className="text-sm font-medium text-gray-600">{formattedDate}</p>
          </div>

          {/* Notification Bell */}
          <div className="relative mr-5">
            <NotificationSystem />
          </div>

          {/* User Profile */}
          <div className="bg-white/70 backdrop-blur-md rounded-xl px-4 py-2.5 shadow-md border border-amber-100/50">
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full flex items-center justify-center mr-3.5 shadow-inner bg-gradient-to-br from-green-100 to-green-200">
                <BsPersonCircle className="text-green-600 size-5" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{lastName}</p>
                <div className="flex items-center">
                  <div className="h-1.5 w-1.5 rounded-full mr-1.5 bg-green-500"></div>
                  <p className="text-xs font-medium text-green-600">
                    {isAdmin() ? 'Admin' : department}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
