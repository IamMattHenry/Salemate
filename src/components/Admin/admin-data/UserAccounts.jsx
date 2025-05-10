import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FiSearch, FiRefreshCw } from "react-icons/fi";
import { FaUserShield, FaEye, FaEyeSlash } from "react-icons/fa";
import AdminNav from "../AdminNav";
import firebaseApp from "../../../firebaseConfig";
import { useAuth } from "../../../context/AuthContext";
import { AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import UserInfoModal from "./UserInfoModal";
import PrivacySettingsModal from "./PrivacySettingsModal";

const UserAccounts = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [actionResult, setActionResult] = useState({ success: false, message: "" });
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRefreshIndicator, setShowRefreshIndicator] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPins, setShowPins] = useState({});
  const rowsPerPage = 5; // Fixed at 5 rows per page
  const refreshTimerRef = useRef(null);
  const dropdownRef = useRef(null);
  const infoModalRef = useRef(null);
  const { isAdmin } = useAuth();
  const db = getFirestore(firebaseApp);
  const auth = getAuth();

  // Handle clicks outside the dropdown to close it and escape key
  useEffect(() => {
    function handleClickOutside(event) {
      // Check if we have a selected user and if the click was outside the dropdown
      if (selectedUser && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Check if the click was not on another action button (which has its own handler)
        const isActionButton = event.target.closest('button') &&
                              event.target.closest('button').classList.contains('action-button');

        if (!isActionButton) {
          setSelectedUser(null);
        }
      }

      // Check if the click was outside the info modal
      if (showInfoModal && infoModalRef.current && !infoModalRef.current.contains(event.target)) {
        closeInfoModal();
      }
    }

    // Handle escape key press
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        if (showInfoModal) {
          closeInfoModal();
        } else if (showActionModal) {
          closeModal();
        }
      }
    }

    // Add event listeners
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedUser, showInfoModal, showActionModal]);

  // Generate formatted user ID (UID001 format)
  const formatUserId = (index) => {
    return `UID${String(index + 1).padStart(3, '0')}`;
  };

  // Format date for display
  const formatDate = useCallback((dateString) => {
    if (!dateString || dateString === "Never") return "Never";

    try {
      const date = new Date(dateString);
      return format(date, "MMM. dd, yyyy");
    } catch (error) {
      // Return the original string if formatting fails
      console.error("Date formatting error:", error);
      return dateString;
    }
  }, []);

  // Fetch all users from Firestore
  const fetchUsers = useCallback(async () => {
    try {
      setIsRefreshing(true);
      if (!searchQuery) {
        // Only show loading indicator on initial load, not during auto-refresh
        if (users.length === 0) {
          setLoading(true);
        }
      }

      console.log("Fetching users from Firestore...");

      const usersCollection = collection(db, "users");
      console.log("Users collection reference:", usersCollection);

      const usersSnapshot = await getDocs(usersCollection);
      console.log("Users snapshot received, count:", usersSnapshot.docs.length);

      if (usersSnapshot.empty) {
        console.log("No users found in the collection");
        setUsers([]);
        setFilteredUsers([]);
        return;
      }

      // Filter out only salemate186@gmail.com account
      const usersList = usersSnapshot.docs
        .filter(doc => {
          const userData = doc.data();
          // Only filter out salemate186@gmail.com
          return userData.email !== 'salemate186@gmail.com';
        })
        .map((doc, index) => {
          const userData = doc.data();
          console.log("User data for", doc.id, ":", userData);

          return {
            id: doc.id,
            ...userData,
            lastSignIn: userData.lastSignIn || "Never",
            formattedUserId: formatUserId(index)
          };
        });

      console.log("Processed users list (salemate186@gmail.com filtered out):", usersList);
      setUsers(usersList);

      // Only update filtered users if no search query is active
      if (!searchQuery) {
        setFilteredUsers(usersList);
      } else {
        // Re-apply the current search filter to the new data
        const lowercasedValue = searchQuery.toLowerCase();
        const filtered = usersList.filter(user => {
          // Only hide salemate186@gmail.com account
          if (user.email === 'salemate186@gmail.com') {
            return false;
          }

          return (
            (user.email && user.email.toLowerCase().includes(lowercasedValue)) ||
            (user.department && user.department.toLowerCase().includes(lowercasedValue)) ||
            (user.formattedUserId && user.formattedUserId.toLowerCase().includes(lowercasedValue)) ||
            (user.createdAt && formatDate(user.createdAt).toLowerCase().includes(lowercasedValue)) ||
            (user.lastSignIn && formatDate(user.lastSignIn).toLowerCase().includes(lowercasedValue)) ||
            (user.pin && user.pin.toString().includes(lowercasedValue))
          );
        });
        setFilteredUsers(filtered);
      }

      // Update last refreshed timestamp
      setLastRefreshed(new Date());

      // Show refresh indicator briefly
      setShowRefreshIndicator(true);
      setTimeout(() => {
        setShowRefreshIndicator(false);
      }, 1500);
    } catch (error) {
      console.error("Error fetching users:", error);
      console.error("Error details:", error.code, error.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery, users.length, db, formatDate]);

  // Handle search functionality
  const handleSearch = (value) => {
    setSearchQuery(value);

    // Use setTimeout to prevent UI jank during typing
    setTimeout(() => {
      if (!value.trim()) {
        setFilteredUsers(users);
        return;
      }

      const lowercasedValue = value.toLowerCase();
      const filtered = users.filter(user => {
        // Only hide salemate186@gmail.com account
        if (user.email === 'salemate186@gmail.com') {
          return false;
        }

        return (
          (user.email && user.email.toLowerCase().includes(lowercasedValue)) ||
          (user.department && user.department.toLowerCase().includes(lowercasedValue)) ||
          (user.formattedUserId && user.formattedUserId.toLowerCase().includes(lowercasedValue)) ||
          (user.createdAt && formatDate(user.createdAt).toLowerCase().includes(lowercasedValue)) ||
          (user.lastSignIn && formatDate(user.lastSignIn).toLowerCase().includes(lowercasedValue)) ||
          (user.pin && user.pin.toString().includes(lowercasedValue))
        );
      });

      setFilteredUsers(filtered);
      // Reset to first page when search results change
      setCurrentPage(1);
    }, 100); // Small delay to ensure smooth UI
  };

  // Handle user action (privacy settings, disable, delete)
  const handleUserAction = (user, action) => {
    // Close the dropdown menu
    setSelectedUser(null);

    // Set up the action modal
    setActionType(action);
    setShowActionModal(true);

    // Small delay to ensure smooth transition
    setTimeout(() => {
      setSelectedUser(user);
    }, 50);
  };

  // Execute the selected action
  const executeAction = async () => {
    if (!selectedUser) return;

    // Start loading animation
    setIsActionLoading(true);
    // Clear any previous action result
    setActionResult({ success: false, message: "" });

    try {
      switch (actionType) {
        case "disable":
          await updateDoc(doc(db, "users", selectedUser.id), {
            disabled: true,
            updatedAt: new Date().toISOString()
          });
          setActionResult({
            success: true,
            message: `Account ${selectedUser.formattedUserId} (${selectedUser.email}) has been disabled`
          });
          // Refresh the user list
          fetchUsers();
          break;

        case "enable":
          await updateDoc(doc(db, "users", selectedUser.id), {
            disabled: false,
            updatedAt: new Date().toISOString()
          });
          setActionResult({
            success: true,
            message: `Account ${selectedUser.formattedUserId} (${selectedUser.email}) has been enabled`
          });
          // Refresh the user list
          fetchUsers();
          break;

        default:
          throw new Error("Invalid action");
      }
    } catch (error) {
      console.error(`Error executing ${actionType} action:`, error);
      setActionResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      // Stop loading animation after action completes (success or error)
      setIsActionLoading(false);
    }
  };

  // Close the action modal
  const closeModal = () => {
    setShowActionModal(false);
    // Clear action result after a delay
    setTimeout(() => {
      setActionResult({ success: false, message: "" });
      setSelectedUser(null);
      setActionType("");
    }, 300);
  };

  // Close the info modal
  const closeInfoModal = () => {
    setShowInfoModal(false);
    // Clear selected user after a delay for smooth animation
    setTimeout(() => {
      setSelectedUser(null);
    }, 300);
  };

  // Handle row click to show user info modal
  const handleRowClick = (user) => {
    // Set the selected user
    setSelectedUser(user);
    // Show the info modal
    setShowInfoModal(true);
  };



  // Toggle PIN visibility
  const togglePinVisibility = (userId) => {
    setShowPins(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Format PIN for display (show as dots or actual PIN)
  const formatPin = (pin, userId) => {
    if (!pin) return "Not set";
    return showPins[userId] ? pin : "••••";
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };

  // Set up auto-refresh timer
  useEffect(() => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    // Set up new timer if auto-refresh is enabled
    if (autoRefresh && isAdmin()) {
      console.log(`Setting up auto-refresh every ${refreshInterval} seconds`);

      // Immediately refresh when auto-refresh is enabled
      fetchUsers();

      // Then set up the interval
      refreshTimerRef.current = setInterval(() => {
        console.log("Auto-refreshing user data...");
        fetchUsers();
      }, refreshInterval * 1000);
    }

    // Clean up on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, fetchUsers, isAdmin]);

  // Load users on component mount
  useEffect(() => {
    console.log("UserAccounts component mounted");

    // Check if user is admin
    const adminStatus = isAdmin();
    console.log("Is user admin?", adminStatus);

    // Only fetch if user is admin
    if (adminStatus) {
      console.log("User is admin, fetching users...");
      fetchUsers();
    } else {
      console.log("User is not admin, skipping fetch");
    }

    // Clean up on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [fetchUsers, isAdmin]);



  // Redirect non-admin users
  if (!isAdmin()) {
    return (
      <div className="w-full min-h-screen bg-gray-50/50 p-6">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <FaUserShield className="text-amber-400 text-6xl mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Access Required</h2>
          <p className="text-gray-600 text-center max-w-md">
            This page is only accessible to administrators. Please contact your system administrator if you need access.
          </p>
        </div>
      </div>
    );
  }



  return (
    <div className="w-full">
      <AdminNav onSearch={handleSearch} />



      {/* Users Section */}
      <div
        className="bg-gradient-to-b from-white to-amber-50/50 backdrop-blur-sm rounded-2xl shadow-lg p-5 md:p-6 border border-amber-100/30 mt-4"
        style={{ overflow: 'hidden' }}
      >
        {/* Header with search and controls */}
        <div
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
        >
          <div className="flex items-center">
            <div className="bg-amber-100/50 p-2.5 rounded-xl mr-3">
              <FaUserShield className="text-amber-500 text-xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">User Accounts</h2>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative group w-full md:w-auto">
              <input
                type="text"
                placeholder="Search by email, ID, or department..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full md:w-64 bg-white border border-amber-200/50 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-amber-300/50 transition-all duration-300 hover:shadow-md"
              />
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 group-hover:text-amber-500 transition-colors duration-300" />
            </div>

            {/* Auto-refresh toggle */}
            <div className="flex items-center bg-white shadow-sm px-4 py-2 rounded-xl border border-amber-100/50 w-full md:w-auto">
              <div className="text-sm text-gray-700 flex items-center mr-3">
                <span className="mr-2 whitespace-nowrap">Auto-refresh</span>
                <button
                  onClick={toggleAutoRefresh}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${autoRefresh ? 'bg-amber-500' : 'bg-gray-200'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${autoRefresh ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
              </div>

              {autoRefresh && (
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="text-xs bg-amber-50 border border-amber-100/50 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-300/50"
                >
                  <option value={10}>10s</option>
                  <option value={30}>30s</option>
                  <option value={60}>1m</option>
                  <option value={300}>5m</option>
                </select>
              )}
            </div>

            {/* Last updated indicator */}
            <div className="text-xs text-gray-600 bg-white shadow-sm px-4 py-2.5 rounded-xl border border-amber-100/50 flex items-center w-full md:w-auto">
              {isRefreshing ? (
                <span className="flex items-center">
                  <FiRefreshCw className="animate-spin mr-2 text-amber-500" />
                  <span>Refreshing...</span>
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                  Last updated: {format(lastRefreshed, "h:mm:ss a")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Users Table with responsive design */}
        <div
          className={`relative transition-all duration-300 rounded-xl border border-amber-200/30 bg-white shadow-md overflow-hidden ${showRefreshIndicator ? 'bg-amber-50/30' : ''}`}
          style={{ minHeight: '400px' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-amber-50 to-amber-100/50">
                  <th className="text-left py-4 px-4 text-amber-800 font-semibold text-sm border-b border-amber-100/50 whitespace-nowrap">User ID</th>
                  <th className="text-left py-4 px-4 text-amber-800 font-semibold text-sm border-b border-amber-100/50 whitespace-nowrap">Email</th>
                  <th className="text-left py-4 px-4 text-amber-800 font-semibold text-sm border-b border-amber-100/50 whitespace-nowrap">Department</th>
                  <th className="text-left py-4 px-4 text-amber-800 font-semibold text-sm border-b border-amber-100/50 whitespace-nowrap hidden md:table-cell">Date Created</th>
                  <th className="text-left py-4 px-4 text-amber-800 font-semibold text-sm border-b border-amber-100/50 whitespace-nowrap hidden md:table-cell">Signed In</th>
                  <th className="text-left py-4 px-4 text-amber-800 font-semibold text-sm border-b border-amber-100/50 whitespace-nowrap">PIN</th>
                  <th className="text-center py-4 px-4 text-amber-800 font-semibold text-sm border-b border-amber-100/50 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="min-h-[300px]">
              {loading ? (
                <tr style={{ height: '300px' }}>
                  <td colSpan="7" className="text-center">
                    <div
                      className="flex flex-col items-center justify-center"
                    >
                      <div
                        className="h-12 w-12 rounded-full border-3 border-amber-300 border-t-transparent animate-spin"
                      />
                      <p className="text-sm text-gray-600 font-medium mt-4">Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr style={{ height: '300px' }}>
                  <td colSpan="7" className="text-center">
                    <div
                      className="bg-amber-50/50 rounded-xl p-8 inline-block border border-amber-100/50 shadow-sm"
                    >
                      <svg className="w-16 h-16 text-amber-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                      </svg>
                      <p className="text-gray-600 font-medium">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Paginate the filtered users - show only 5 rows per page
                filteredUsers
                  .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                  .map((user) => (
                  <tr
                    key={user.id}
                    className={`group border-b border-amber-100/30 transition-all duration-300 ${user.disabled ? 'bg-red-50/40' : ''} cursor-pointer hover:bg-amber-50/30`}
                    onClick={(e) => {
                      // Prevent row click if clicking on a button or link
                      if (
                        e.target.tagName === 'BUTTON' ||
                        e.target.closest('button') ||
                        e.target.tagName === 'A' ||
                        e.target.closest('a')
                      ) {
                        return;
                      }
                      handleRowClick(user);
                    }}
                  >
                    {/* User ID */}
                    <td className="py-4 px-4 transition-all duration-300 group-hover:text-gray-800">
                      <span className={`text-xs font-medium rounded-lg px-3 py-1.5 shadow-sm inline-block transition-all duration-200 ${
                        user.disabled
                          ? 'text-gray-500 bg-gray-50 border border-gray-200'
                          : 'text-amber-700 bg-amber-50 border border-amber-200/50 group-hover:bg-amber-100/70 group-hover:border-amber-300/50 group-hover:shadow-md'
                      }`}>
                        {user.formattedUserId}
                      </span>
                    </td>

                    {/* Email with Profile Picture */}
                    <td className="py-4 px-4 transition-all duration-300 group-hover:text-gray-800">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full overflow-hidden mr-3 border border-amber-200 flex-shrink-0 bg-amber-50">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={`${user.firstName || ''} ${user.lastName || ''}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-amber-100 text-amber-500">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <a
                            href={`mailto:${user.email}`}
                            className={`text-blue-600 hover:text-amber-600 group-hover:text-amber-600 hover:underline transition-all duration-200 group-hover:font-medium ${user.disabled ? 'text-opacity-70' : ''}`}
                          >
                            {user.email}
                          </a>
                          {(user.firstName || user.lastName) && (
                            <span className="text-xs text-gray-500">
                              {user.firstName || ''} {user.lastName || ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-4 px-4 transition-all duration-300 group-hover:text-gray-800 group-hover:font-medium">
                      <div className="flex items-center">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                          user.disabled ? 'line-through text-gray-500 bg-gray-50' :
                          user.department === 'Admin' ? 'text-purple-700 bg-purple-50 border border-purple-100' :
                          user.department === 'Marketing' ? 'text-blue-700 bg-blue-50 border border-blue-100' :
                          user.department === 'Financial' ? 'text-green-700 bg-green-50 border border-green-100' :
                          user.department === 'Production' ? 'text-amber-700 bg-amber-50 border border-amber-100' :
                          'text-gray-700 bg-gray-50 border border-gray-100'
                        }`}>
                          {user.department || 'N/A'}
                        </span>
                        {user.disabled && (
                          <span className="ml-2 text-xs font-medium text-white bg-red-500 group-hover:bg-red-600 rounded-md px-2 py-0.5 shadow-sm transition-all duration-200">
                            Disabled
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date Created - Hidden on mobile */}
                    <td className="py-4 px-4 transition-all duration-300 group-hover:text-gray-800 group-hover:font-medium hidden md:table-cell">
                      <span className={`text-xs ${user.disabled ? 'text-gray-500' : 'text-gray-600'}`}>
                        {formatDate(user.createdAt)}
                      </span>
                    </td>

                    {/* Signed In - Hidden on mobile */}
                    <td className="py-4 px-4 transition-all duration-300 group-hover:text-gray-800 group-hover:font-medium hidden md:table-cell">
                      <span className={`text-xs ${user.disabled ? 'text-gray-500' : 'text-gray-600'}`}>
                        {formatDate(user.lastSignIn)}
                      </span>
                    </td>

                    {/* PIN */}
                    <td className="py-4 px-4 transition-all duration-300 group-hover:text-gray-800">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium mr-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                          user.disabled
                            ? 'bg-gray-50 text-gray-400 border border-gray-200'
                            : user.pin
                              ? 'bg-purple-50 text-purple-700 border border-purple-100 group-hover:bg-purple-100 group-hover:border-purple-200 group-hover:shadow-md'
                              : 'bg-gray-50 text-gray-500 border border-gray-100 group-hover:bg-gray-100 group-hover:border-gray-200 group-hover:shadow-md'
                        }`}>
                          {formatPin(user.pin, user.id)}
                        </span>
                        <button
                          onClick={() => togglePinVisibility(user.id)}
                          className="text-gray-400 hover:text-amber-500 group-hover:text-amber-500 transition-all duration-200 p-1.5 rounded-full hover:bg-amber-50 group-hover:bg-amber-50 group-hover:shadow-sm hover:scale-110 active:scale-95"
                          title={showPins[user.id] ? "Hide PIN" : "Show PIN"}
                        >
                          {showPins[user.id] ? (
                            <FaEyeSlash className="w-4 h-4" />
                          ) : (
                            <FaEye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 transition-all duration-300">
                      <div className="flex flex-wrap justify-center gap-3 transition-all duration-200">
                        {/* Privacy Settings Button */}
                        <button
                          className="action-button text-gray-500 hover:text-blue-500 bg-white hover:bg-blue-50 rounded-full p-2.5 shadow-sm transition-all duration-200 border border-gray-100 hover:border-blue-200 hover:scale-110 active:scale-90 hover:shadow-md"
                          onClick={() => handleUserAction(user, "privacySettings")}
                          title="Privacy Settings"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>

                        {/* Enable/Disable Button */}
                        {user.disabled ? (
                          <button
                            className="action-button text-gray-500 hover:text-green-500 bg-white hover:bg-green-50 rounded-full p-2.5 shadow-sm transition-all duration-200 border border-gray-100 hover:border-green-200 hover:scale-110 active:scale-90 hover:shadow-md"
                            onClick={() => handleUserAction(user, "enable")}
                            title="Enable Account"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            className="action-button text-gray-500 hover:text-orange-500 bg-white hover:bg-orange-50 rounded-full p-2.5 shadow-sm transition-all duration-200 border border-gray-100 hover:border-orange-200 hover:scale-110 active:scale-90 hover:shadow-md"
                            onClick={() => handleUserAction(user, "disable")}
                            title="Disable Account"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>

          {/* Pagination Controls */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between sm:justify-center px-4 py-5 bg-gradient-to-r from-white to-amber-50/30 border-t border-amber-100/30"
          >
            {/* Page info - visible on mobile */}
            <div className="text-sm text-gray-600 mb-3 sm:hidden">
              Page {currentPage} of {Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage))}
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {/* First page button */}
              <button
                className={`p-2 rounded-lg ${currentPage === 1 ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-white text-amber-600 hover:bg-amber-50 border border-amber-100/50 hover:border-amber-200 shadow-sm hover:shadow hover:scale-105 active:scale-95'} transition-all duration-200`}
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                aria-label="First page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>

              {/* Previous page button */}
              <button
                className={`p-2 rounded-lg ${currentPage === 1 ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-white text-amber-600 hover:bg-amber-50 border border-amber-100/50 hover:border-amber-200 shadow-sm hover:shadow hover:scale-105 active:scale-95'} transition-all duration-200`}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page numbers - hidden on small screens */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(5, Math.ceil(filteredUsers.length / rowsPerPage)) }, (_, i) => {
                  // Calculate which page numbers to show
                  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
                  let pageNum;

                  if (totalPages <= 5) {
                    // If 5 or fewer pages, show all pages
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    // If on pages 1-3, show pages 1-5
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    // If on last 3 pages, show last 5 pages
                    pageNum = totalPages - 4 + i;
                  } else {
                    // Otherwise show current page and 2 pages on each side
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium ${
                        currentPage === pageNum
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-600 border border-amber-100/50 hover:border-amber-200 shadow-sm hover:shadow hover:scale-105 active:scale-95'
                      } transition-all duration-200`}
                      onClick={() => setCurrentPage(pageNum)}
                      aria-label={`Page ${pageNum}`}
                      aria-current={currentPage === pageNum ? "page" : undefined}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next page button */}
              <button
                className={`p-2 rounded-lg ${
                  currentPage >= Math.ceil(filteredUsers.length / rowsPerPage)
                    ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                    : 'bg-white text-amber-600 hover:bg-amber-50 border border-amber-100/50 hover:border-amber-200 shadow-sm hover:shadow hover:scale-105 active:scale-95'
                } transition-all duration-200`}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredUsers.length / rowsPerPage)))}
                disabled={currentPage >= Math.ceil(filteredUsers.length / rowsPerPage)}
                aria-label="Next page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Last page button */}
              <button
                className={`p-2 rounded-lg ${
                  currentPage >= Math.ceil(filteredUsers.length / rowsPerPage)
                    ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                    : 'bg-white text-amber-600 hover:bg-amber-50 border border-amber-100/50 hover:border-amber-200 shadow-sm hover:shadow hover:scale-105 active:scale-95'
                } transition-all duration-200`}
                onClick={() => setCurrentPage(Math.ceil(filteredUsers.length / rowsPerPage))}
                disabled={currentPage >= Math.ceil(filteredUsers.length / rowsPerPage)}
                aria-label="Last page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Page info - hidden on mobile */}
            <div className="hidden sm:block text-sm text-gray-600 ml-4">
              Page {currentPage} of {Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage))}
            </div>
          </div>
        </div>
      </div>

      {/* User Info Modal */}
      <UserInfoModal
        showModal={showInfoModal}
        user={selectedUser}
        onClose={closeInfoModal}
        onPrivacySettings={() => {
          closeInfoModal();
          setTimeout(() => {
            handleUserAction(selectedUser, "privacySettings");
          }, 300);
        }}
        onDisable={() => {
          closeInfoModal();
          setTimeout(() => {
            handleUserAction(selectedUser, "disable");
          }, 300);
        }}
        onEnable={() => {
          closeInfoModal();
          setTimeout(() => {
            handleUserAction(selectedUser, "enable");
          }, 300);
        }}
      />

      {/* Privacy Settings Modal */}
      {actionType === "privacySettings" && (
        <PrivacySettingsModal
          showModal={showActionModal}
          user={selectedUser}
          onClose={closeModal}
          auth={auth}
          db={db}
          onActionComplete={(result) => {
            setActionResult({
              success: result.success || true,
              message: result.message
            });
            // Refresh the user list after a successful action
            if (result.success) {
              setTimeout(() => {
                fetchUsers();
              }, 1000);
            }
          }}
        />
      )}

      {/* Action Confirmation Modal (for enable/disable) */}
      <AnimatePresence>
        {showActionModal && actionType !== "privacySettings" && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={closeModal}
          >
            <div
              className="bg-gradient-to-br from-white via-amber-50/30 to-amber-100/20 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 border border-amber-100/50 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-200/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-300/10 rounded-full blur-2xl"></div>

              <h3
                className="text-xl font-bold mb-4 text-gray-800"
              >
                {actionType === "disable" ? "Disable Account" : "Enable Account"}
              </h3>

              {selectedUser && (
                <div
                  className="mb-4 flex items-center bg-amber-50/50 p-4 rounded-xl border border-amber-100/30"
                >
                  {selectedUser.profilePicture ? (
                    <div className="h-12 w-12 rounded-full overflow-hidden mr-4 border-2 border-amber-200 flex-shrink-0 shadow-sm">
                      <img
                        src={selectedUser.profilePicture}
                        alt={`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="bg-amber-100/50 p-2 rounded-lg mr-3">
                      <FaUserShield className="text-amber-500 text-lg" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-amber-700 bg-white rounded-lg px-2.5 py-1 mb-1 shadow-sm inline-block border border-amber-100/50">
                      {selectedUser.formattedUserId}
                    </span>
                    <span className="text-sm text-gray-700 font-medium">{selectedUser.email}</span>
                    {(selectedUser.firstName || selectedUser.lastName) && (
                      <span className="text-xs text-gray-500 mt-0.5">
                        {selectedUser.firstName || ''} {selectedUser.lastName || ''}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {actionResult.message ? (
                <div
                  className={`p-4 mb-4 rounded-lg flex items-start ${
                    actionResult.success
                      ? 'bg-green-50 text-green-700 border border-green-100'
                      : 'bg-red-50 text-red-700 border border-red-100'
                  }`}
                >
                  <div className={`rounded-full p-1 mr-3 ${
                    actionResult.success ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {actionResult.success ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    )}
                  </div>
                  <p>{actionResult.message}</p>
                </div>
              ) : (
                <div
                  className={`p-4 mb-6 rounded-lg ${
                    actionType === "disable"
                      ? 'bg-gradient-to-r from-orange-50 to-orange-100/30 border border-orange-100/50'
                      : 'bg-gradient-to-r from-green-50 to-green-100/30 border border-green-100/50'
                  }`}
                >
                  <p className={`${
                    actionType === "disable" ? 'text-orange-700' : 'text-green-700'
                  }`}>
                    {actionType === "disable"
                      ? `Are you sure you want to disable this account? The user will no longer be able to log in.`
                      : `Are you sure you want to enable this account? The user will be able to log in again.`}
                  </p>
                </div>
              )}

              <div
                className="flex justify-end space-x-3 mt-6"
              >
                <button
                  onClick={closeModal}
                  className="px-5 py-2.5 border border-amber-100/50 rounded-xl text-gray-600 hover:bg-amber-50 transition-all duration-200 shadow-sm font-medium hover:scale-105 active:scale-95 hover:shadow-md"
                >
                  {actionResult.message ? 'Close' : 'Cancel'}
                </button>

                {!actionResult.message && (
                  <button
                    onClick={executeAction}
                    disabled={isActionLoading}
                    className={`px-5 py-2.5 text-white rounded-xl shadow-md transition-all duration-200 font-medium relative overflow-hidden hover:scale-105 active:scale-95 ${
                      actionType === "disable"
                        ? 'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 hover:shadow-orange-200'
                        : 'bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 hover:shadow-green-200'
                    } ${isActionLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                    {isActionLoading ? (
                      <div className="flex items-center justify-center relative z-10">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center relative z-10">
                        {actionType === "disable" ? (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Disable Account
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Enable Account
                          </>
                        )}
                      </div>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserAccounts;
