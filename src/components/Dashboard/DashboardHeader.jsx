import React, { useEffect, useState, useRef } from "react";
import { BsPersonCircle } from "react-icons/bs";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import {
  MdDashboard,
  MdInventory,
  MdAnalytics,
  MdShoppingCart,
  MdPeople,
  MdAdminPanelSettings,
  MdSettings,
  MdLogout,
  MdKeyboardArrowDown
} from "react-icons/md";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import firebaseApp from "../../firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import NotificationSystem from "../common/NotificationSystem";
import { motion, AnimatePresence } from "framer-motion";

const DashboardHeader = () => {
  const [lastName, setLastName] = useState(""); // State to store the last name
  const [department, setDepartment] = useState(""); // State to store the department
  const [profilePicture, setProfilePicture] = useState(null); // State to store profile picture URL
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const { isAdmin, logout } = useAuth(); // Get the isAdmin function and logout from AuthContext
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);

  // Fetch user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setLastName(userData.lastName); // Fetch the last name
            setDepartment(userData.department); // Fetch the department

            // Set profile picture if available
            if (userData.profilePicture) {
              setProfilePicture(userData.profilePicture);
            }
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

  // Handle click outside to close dropdown and modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown if clicked outside
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }

      // Close modal if clicked outside
      if (modalRef.current && !modalRef.current.contains(event.target) && showLogoutModal) {
        setShowLogoutModal(false);
      }
    };

    // Handle escape key to close modal
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        if (showLogoutModal) {
          setShowLogoutModal(false);
        } else if (dropdownOpen) {
          setDropdownOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [showLogoutModal, dropdownOpen]);

  // Show logout confirmation modal
  const showLogoutConfirmation = () => {
    setDropdownOpen(false);
    setShowLogoutModal(true);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setShowLogoutModal(false);
      await logout();
      navigate('/signin');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Handle profile/settings navigation
  const handleProfileSettings = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };





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
      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogoutModal(false)}
          >
            <motion.div
              ref={modalRef}
              className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden border border-amber-100"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 bg-gradient-to-r from-amber-500 to-amber-600 flex items-center">
                <div className="bg-white/20 p-2 rounded-full mr-3">
                  <MdLogout className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold text-white">Confirm Logout</h3>
              </div>

              <div className="p-6">
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-amber-800">You're about to sign out</h4>
                      <div className="mt-2 text-sm text-amber-700">
                        <p>
                          Are you sure you want to log out of your account? You will need to sign in again to access your dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-3">
                  <div className="text-sm text-gray-500">
                    Logged in as <span className="font-medium text-gray-700">{lastName}</span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowLogoutModal(false)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors border border-gray-200 hover:border-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-white font-medium transition-colors shadow-sm hover:shadow flex items-center"
                    >
                      <MdLogout className="mr-1.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

          {/* User Profile with Dropdown */}
          <div ref={dropdownRef} className="relative">
            <div
              className="bg-white/70 backdrop-blur-md rounded-xl px-4 py-2.5 shadow-md border border-amber-100/50 cursor-pointer hover:bg-white/90 transition-all duration-200"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="flex items-center">
                <div className="h-9 w-9 rounded-full flex items-center justify-center mr-3.5 shadow-inner bg-gradient-to-br from-green-100 to-green-200 overflow-hidden">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BsPersonCircle className="text-green-600 size-5" />
                  )}
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
                <MdKeyboardArrowDown className={`ml-2 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-amber-100/50 overflow-hidden z-50"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="py-1">
                    <button
                      onClick={handleProfileSettings}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 flex items-center transition-colors duration-150"
                    >
                      <MdSettings className="mr-3 text-amber-500" />
                      Profile Settings
                    </button>
                    <div className="border-t border-gray-100"></div>
                    <button
                      onClick={showLogoutConfirmation}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 flex items-center transition-colors duration-150"
                    >
                      <MdLogout className="mr-3 text-amber-500" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
