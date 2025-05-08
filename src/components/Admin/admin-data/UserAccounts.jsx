import React, { useState, useEffect, useRef } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { FiSearch, FiRefreshCw } from "react-icons/fi";
import { FaUserShield, FaEye, FaEyeSlash } from "react-icons/fa";
import AdminNav from "../AdminNav";
import firebaseApp from "../../../firebaseConfig";
import { useAuth } from "../../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const UserAccounts = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
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
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [privacySettingsTab, setPrivacySettingsTab] = useState("password"); // "password", "pin", "department"
  const rowsPerPage = 5; // Fixed at 5 rows per page
  const refreshTimerRef = useRef(null);
  const dropdownRef = useRef(null);
  const { isAdmin } = useAuth();
  const db = getFirestore(firebaseApp);
  const auth = getAuth();

  // Handle clicks outside the dropdown to close it
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
    }

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedUser]);

  // Generate formatted user ID (UID001 format)
  const formatUserId = (index) => {
    return `UID${String(index + 1).padStart(3, '0')}`;
  };

  // Fetch all users from Firestore
  const fetchUsers = async () => {
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
  };

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

    // Reset fields when opening the modal
    if (action === "privacySettings") {
      // Default to password tab
      setPrivacySettingsTab("password");

      // Reset PIN fields
      setNewPin("");
      setConfirmPin("");
      setPinError("");

      // Set department to current value or default to Production if not set
      setNewDepartment(user.department || "Production");
    }

    // Small delay to ensure smooth transition
    setTimeout(() => {
      setSelectedUser(user);
    }, 50);
  };

  // Handle PIN change
  const handlePinChange = async () => {
    // Validate PIN
    if (newPin.length !== 4) {
      setPinError("PIN must be 4 digits");
      return;
    }

    if (!/^\d{4}$/.test(newPin)) {
      setPinError("PIN must contain only digits");
      return;
    }

    if (newPin !== confirmPin) {
      setPinError("PINs do not match");
      return;
    }

    // Start loading animation
    setIsActionLoading(true);

    try {
      // Update PIN in Firestore
      const userDocRef = doc(db, "users", selectedUser.id);
      await updateDoc(userDocRef, {
        pin: newPin,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          return { ...user, pin: newPin };
        }
        return user;
      });

      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers.filter(user => user.email !== 'salemate186@gmail.com'));

      // Show success message
      setActionResult({
        success: true,
        message: "PIN changed successfully"
      });

      // Reset fields
      setNewPin("");
      setConfirmPin("");
      setPinError("");
    } catch (error) {
      console.error("Error changing PIN:", error);
      setActionResult({
        success: false,
        message: `Error changing PIN: ${error.message}`
      });
    } finally {
      // Stop loading animation
      setIsActionLoading(false);
    }
  };

  // Handle department change
  const handleDepartmentChange = async () => {
    if (!newDepartment) {
      setActionResult({
        success: false,
        message: "Please select a department"
      });
      return;
    }

    // Check if department is one of the allowed values
    const allowedDepartments = ["Production", "Financial", "Marketing"];
    if (!allowedDepartments.includes(newDepartment)) {
      setActionResult({
        success: false,
        message: "Please select a valid department"
      });
      return;
    }

    // Start loading animation
    setIsActionLoading(true);

    try {
      // Update department in Firestore
      const userDocRef = doc(db, "users", selectedUser.id);
      await updateDoc(userDocRef, {
        department: newDepartment,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          return { ...user, department: newDepartment };
        }
        return user;
      });

      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers.filter(user => user.email !== 'salemate186@gmail.com'));

      // Show success message
      setActionResult({
        success: true,
        message: "Department updated successfully"
      });
    } catch (error) {
      console.error("Error changing department:", error);
      setActionResult({
        success: false,
        message: `Error updating department: ${error.message}`
      });
    } finally {
      // Stop loading animation
      setIsActionLoading(false);
    }
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
        case "privacySettings":
          // Handle different tabs in the privacy settings modal
          if (privacySettingsTab === "password") {
            await sendPasswordResetEmail(auth, selectedUser.email);
            setActionResult({
              success: true,
              message: `Password reset email sent to ${selectedUser.formattedUserId} (${selectedUser.email})`
            });
          } else if (privacySettingsTab === "pin") {
            // The PIN change is handled by the handlePinChange function
            await handlePinChange();
          } else if (privacySettingsTab === "department") {
            // The department change is handled by the handleDepartmentChange function
            await handleDepartmentChange();
          }
          break;

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

  // Close the modal
  const closeModal = () => {
    setShowActionModal(false);
    // Clear action result after a delay
    setTimeout(() => {
      setActionResult({ success: false, message: "" });
      setSelectedUser(null);
      setActionType("");
    }, 300);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString === "Never") return "Never";

    try {
      const date = new Date(dateString);
      return format(date, "MMM. dd, yyyy");
    } catch (error) {
      return dateString;
    }
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
  }, [autoRefresh, refreshInterval]);

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
  }, []);



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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div
      className="w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <AdminNav onSearch={handleSearch} />

      {/* Header - Table text removed */}
      <motion.div
        className="flex justify-between items-center mb-6"
        variants={itemVariants}
      >
      </motion.div>

      {/* Users Section */}
      <motion.div
        className="bg-whitesm/90 backdrop-blur-sm rounded-xl shadow-md p-6 border border-yellowsm/10"
        style={{ overflow: 'hidden' }}
        variants={itemVariants}
      >
        <motion.div
          className="flex justify-between items-center mb-6"
          variants={itemVariants}
        >
          <h2 className="text-xl font-semibold font-league text-gray-800">Salemate</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white shadow-sm px-3 py-1.5 rounded-lg border border-gray-100">
              <div className="text-sm text-gray-600 flex items-center mr-3">
                <span className="mr-2">Auto-refresh</span>
                <button
                  onClick={toggleAutoRefresh}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${autoRefresh ? 'bg-yellow-500' : 'bg-gray-200'}`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${autoRefresh ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
              </div>

              {autoRefresh && (
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="text-xs bg-gray-50 border border-gray-100 rounded-md px-2 py-1 focus:outline-none"
                >
                  <option value={10}>10s</option>
                  <option value={30}>30s</option>
                  <option value={60}>1m</option>
                  <option value={300}>5m</option>
                </select>
              )}
            </div>

            <div className="text-xs text-gray-500 bg-white shadow-sm px-3 py-1.5 rounded-lg border border-gray-100">
              {isRefreshing ? (
                <span className="flex items-center">
                  <FiRefreshCw className="animate-spin mr-1 text-yellow-500" />
                  Refreshing...
                </span>
              ) : (
                <span>
                  Last updated: {format(lastRefreshed, "h:mm:ss a")}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          className="flex flex-wrap gap-4 mb-6 items-center"
          variants={itemVariants}
        >
          <div className="relative ml-auto group">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 w-64 bg-white/80 border border-yellowsm/20 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-yellowsm/50 transition-all duration-300 hover:shadow-md hover:border-yellowsm/30"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-yellowsm transition-colors duration-300" />
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          className={`relative transition-all duration-300 rounded-xl border border-yellowsm/20 bg-white/90 backdrop-blur-sm shadow-md ${showRefreshIndicator ? 'bg-yellowsm/5' : ''}`}
          style={{ minHeight: '400px', overflowX: 'hidden' }}
          variants={itemVariants}
        >
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-yellowsm/10">
                <th className="text-left py-3.5 px-4 text-gray-700 font-semibold text-sm border-b border-yellowsm/20 w-[10%] font-league">User ID</th>
                <th className="text-left py-3.5 px-4 text-gray-700 font-semibold text-sm border-b border-yellowsm/20 w-[18%] font-league">Email</th>
                <th className="text-left py-3.5 px-4 text-gray-700 font-semibold text-sm border-b border-yellowsm/20 w-[12%] font-league">Department</th>
                <th className="text-left py-3.5 px-4 text-gray-700 font-semibold text-sm border-b border-yellowsm/20 w-[12%] font-league">Date Created</th>
                <th className="text-left py-3.5 px-4 text-gray-700 font-semibold text-sm border-b border-yellowsm/20 w-[12%] font-league">Signed In</th>
                <th className="text-left py-3.5 px-4 text-gray-700 font-semibold text-sm border-b border-yellowsm/20 w-[12%] font-league">PIN</th>
                <th className="text-center py-3.5 px-4 text-gray-700 font-semibold text-sm border-b border-yellowsm/20 w-[24%] font-league">Actions</th>
              </tr>
            </thead>
            <tbody className="min-h-[300px]">
              {loading ? (
                <tr style={{ height: '300px' }}>
                  <td colSpan="7" className="text-center">
                    <motion.div
                      className="flex flex-col items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className="h-12 w-12 rounded-full border-3 border-yellowsm border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <p className="text-sm text-gray-600 font-medium mt-4 font-latrue">Loading users...</p>
                    </motion.div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr style={{ height: '300px' }}>
                  <td colSpan="7" className="text-center">
                    <motion.div
                      className="bg-yellowsm/5 rounded-xl p-8 inline-block border border-yellowsm/20 shadow-sm"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <svg className="w-16 h-16 text-yellowsm/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                      </svg>
                      <p className="text-gray-600 font-medium font-latrue">No users found</p>
                    </motion.div>
                  </td>
                </tr>
              ) : (
                // Paginate the filtered users - show only 5 rows per page
                filteredUsers
                  .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                  .map((user, index) => (
                  <motion.tr
                    key={user.id}
                    className={`group border-b border-yellowsm/10 transition-all duration-300 ${user.disabled ? 'bg-red-50/30' : ''}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 100,
                      damping: 15
                    }}
                    whileHover={{
                      backgroundColor: user.disabled ? "rgba(254, 202, 202, 0.4)" : "rgba(255, 207, 80, 0.15)",
                      boxShadow: user.disabled
                        ? "inset 0 0 15px rgba(248, 113, 113, 0.2)"
                        : "inset 0 0 15px rgba(255, 207, 80, 0.3)",
                      transition: {
                        duration: 0.2,
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }
                    }}
                    variants={{
                      hover: {
                        filter: "brightness(1.05)",
                      }
                    }}
                  >
                    <td className="py-3 px-4 transition-all duration-300 group-hover:text-gray-800">
                      <span className={`text-xs font-medium rounded-md px-2.5 py-1.5 shadow-sm inline-block transition-all duration-200 ${
                        user.disabled
                          ? 'text-gray-500 bg-gray-50 border border-gray-200'
                          : 'text-gray-600 bg-yellowsm/10 border border-yellowsm/20 hover:bg-yellowsm/20 group-hover:bg-yellowsm/30 group-hover:border-yellowsm/40 group-hover:shadow-md'
                      }`}>
                        {user.formattedUserId}
                      </span>
                    </td>
                    <td className="py-3 px-4 transition-all duration-300 group-hover:text-gray-800">
                      <div className="flex items-center">
                        <a href={`mailto:${user.email}`} className={`text-blue-600 hover:text-yellow-600 group-hover:text-yellowsm hover:underline transition-all duration-200 group-hover:font-medium ${user.disabled ? 'text-opacity-70' : ''}`}>
                          {user.email}
                        </a>
                      </div>
                    </td>
                    <td className="py-3 px-4 transition-all duration-300 group-hover:text-gray-800 group-hover:font-medium">
                      <div className="flex items-center">
                        <span className={user.disabled ? 'line-through text-gray-500' : ''}>
                          {user.department || 'N/A'}
                        </span>
                        {user.disabled && (
                          <span className="ml-2 text-xs font-medium text-white bg-red-500 group-hover:bg-red-600 rounded-md px-2 py-0.5 shadow-sm transition-all duration-200">
                            Disabled
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 transition-all duration-300 group-hover:text-gray-800 group-hover:font-medium">
                      <span className={user.disabled ? 'text-gray-500' : ''}>
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                    <td className="py-3 px-4 transition-all duration-300 group-hover:text-gray-800 group-hover:font-medium">
                      <span className={user.disabled ? 'text-gray-500' : ''}>
                        {formatDate(user.lastSignIn)}
                      </span>
                    </td>
                    <td className="py-3 px-4 transition-all duration-300 group-hover:text-gray-800">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium mr-2 px-2.5 py-1 rounded-md transition-all duration-200 ${
                          user.disabled
                            ? 'bg-gray-50 text-gray-400 border border-gray-200'
                            : user.pin
                              ? 'bg-purple-50 text-purple-700 border border-purple-100 group-hover:bg-purple-100 group-hover:border-purple-200 group-hover:shadow-md'
                              : 'bg-gray-50 text-gray-500 border border-gray-100 group-hover:bg-gray-100 group-hover:border-gray-200 group-hover:shadow-md'
                        }`}>
                          {formatPin(user.pin, user.id)}
                        </span>
                        <motion.button
                          onClick={() => togglePinVisibility(user.id)}
                          className="text-gray-400 hover:text-yellowsm group-hover:text-yellowsm/80 transition-all duration-200 p-1 rounded-full hover:bg-yellowsm/10 group-hover:bg-yellowsm/10 group-hover:shadow-sm"
                          title={showPins[user.id] ? "Hide PIN" : "Show PIN"}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {showPins[user.id] ? (
                            <FaEyeSlash className="w-4 h-4" />
                          ) : (
                            <FaEye className="w-4 h-4" />
                          )}
                        </motion.button>
                      </div>
                    </td>
                    <td className="py-3 px-4 transition-all duration-300">
                      <div className="flex flex-wrap justify-center gap-3 transition-all duration-200">
                        {/* Privacy Settings Button */}
                        <motion.button
                          className="action-button text-gray-500 hover:text-blue-500 bg-white hover:bg-blue-50 rounded-full p-2 shadow-sm transition-all duration-200 border border-gray-100 hover:border-blue-200"
                          onClick={() => handleUserAction(user, "privacySettings")}
                          whileHover={{ scale: 1.1, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
                          whileTap={{ scale: 0.9 }}
                          title="Privacy Settings"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </motion.button>

                        {/* Enable/Disable Button */}
                        {user.disabled ? (
                          <motion.button
                            className="action-button text-gray-500 hover:text-green-500 bg-white hover:bg-green-50 rounded-full p-2 shadow-sm transition-all duration-200 border border-gray-100 hover:border-green-200"
                            onClick={() => handleUserAction(user, "enable")}
                            whileHover={{ scale: 1.1, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
                            whileTap={{ scale: 0.9 }}
                            title="Enable Account"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </motion.button>
                        ) : (
                          <motion.button
                            className="action-button text-gray-500 hover:text-orange-500 bg-white hover:bg-orange-50 rounded-full p-2 shadow-sm transition-all duration-200 border border-gray-100 hover:border-orange-200"
                            onClick={() => handleUserAction(user, "disable")}
                            whileHover={{ scale: 1.1, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
                            whileTap={{ scale: 0.9 }}
                            title="Disable Account"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </motion.button>
                        )}


                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <motion.div
            className="flex items-center justify-center px-4 py-4 bg-white/90 border-t border-yellowsm/20 h-16"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="flex items-center space-x-2">
              {/* First page button */}
              <motion.button
                className={`p-1.5 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-yellowsm/10 hover:text-yellowsm border border-gray-100 hover:border-yellowsm/30'} transition-all duration-200`}
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                whileHover={currentPage !== 1 ? { scale: 1.1 } : {}}
                whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </motion.button>

              {/* Previous page button */}
              <motion.button
                className={`p-1.5 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-yellowsm/10 hover:text-yellowsm border border-gray-100 hover:border-yellowsm/30'} transition-all duration-200`}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                whileHover={currentPage !== 1 ? { scale: 1.1 } : {}}
                whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>

              {/* Page numbers */}
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
                  <motion.button
                    key={pageNum}
                    className={`px-3 py-1.5 rounded-md ${currentPage === pageNum ? 'bg-yellowsm text-white font-medium shadow-md' : 'bg-white text-gray-600 hover:bg-yellowsm/10 hover:text-yellowsm border border-gray-100 hover:border-yellowsm/30'} transition-all duration-200`}
                    onClick={() => setCurrentPage(pageNum)}
                    whileHover={currentPage !== pageNum ? { scale: 1.1 } : {}}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                  >
                    {pageNum}
                  </motion.button>
                );
              })}

              {/* Next page button */}
              <motion.button
                className={`p-1.5 rounded-md ${currentPage >= Math.ceil(filteredUsers.length / rowsPerPage) ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-yellowsm/10 hover:text-yellowsm border border-gray-100 hover:border-yellowsm/30'} transition-all duration-200`}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredUsers.length / rowsPerPage)))}
                disabled={currentPage >= Math.ceil(filteredUsers.length / rowsPerPage)}
                whileHover={currentPage < Math.ceil(filteredUsers.length / rowsPerPage) ? { scale: 1.1 } : {}}
                whileTap={currentPage < Math.ceil(filteredUsers.length / rowsPerPage) ? { scale: 0.95 } : {}}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>

              {/* Last page button */}
              <motion.button
                className={`p-1.5 rounded-md ${currentPage >= Math.ceil(filteredUsers.length / rowsPerPage) ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-yellowsm/10 hover:text-yellowsm border border-gray-100 hover:border-yellowsm/30'} transition-all duration-200`}
                onClick={() => setCurrentPage(Math.ceil(filteredUsers.length / rowsPerPage))}
                disabled={currentPage >= Math.ceil(filteredUsers.length / rowsPerPage)}
                whileHover={currentPage < Math.ceil(filteredUsers.length / rowsPerPage) ? { scale: 1.1 } : {}}
                whileTap={currentPage < Math.ceil(filteredUsers.length / rowsPerPage) ? { scale: 0.95 } : {}}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Action Confirmation Modal */}
      <AnimatePresence>
        {showActionModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6 border border-yellowsm/20"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                {actionType === "privacySettings" ? "Privacy Settings" :
                 actionType === "disable" ? "Disable Account" :
                 "Enable Account"}
              </h3>

              {selectedUser && (
                <div className="mb-4 flex items-center bg-gray-50 p-3 rounded-lg">
                  <span className="text-xs font-medium text-gray-500 bg-white rounded-md px-2 py-1 mr-2 shadow-sm">
                    {selectedUser.formattedUserId}
                  </span>
                  <span className="text-sm text-gray-700">{selectedUser.email}</span>
                </div>
              )}

              {actionResult.message ? (
                <div className={`p-4 mb-4 rounded-lg flex items-start ${
                  actionResult.success
                    ? 'bg-green-50 text-green-700 border border-green-100'
                    : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
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
              ) : actionType === "privacySettings" ? (
                <div className="mb-6">
                  {/* Tabs for Privacy Settings */}
                  <div className="flex border-b border-gray-200 mb-6">
                    <button
                      className={`py-2 px-4 font-medium text-sm rounded-t-lg ${
                        privacySettingsTab === "password"
                          ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                          : 'text-gray-500 hover:text-blue-500'
                      }`}
                      onClick={() => setPrivacySettingsTab("password")}
                    >
                      Reset Password
                    </button>
                    <button
                      className={`py-2 px-4 font-medium text-sm rounded-t-lg ${
                        privacySettingsTab === "pin"
                          ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-500'
                          : 'text-gray-500 hover:text-purple-500'
                      }`}
                      onClick={() => setPrivacySettingsTab("pin")}
                    >
                      Change PIN
                    </button>
                    <button
                      className={`py-2 px-4 font-medium text-sm rounded-t-lg ${
                        privacySettingsTab === "department"
                          ? 'bg-green-50 text-green-600 border-b-2 border-green-500'
                          : 'text-gray-500 hover:text-green-500'
                      }`}
                      onClick={() => setPrivacySettingsTab("department")}
                    >
                      Change Department
                    </button>
                  </div>

                  {/* Tab Content with Animation */}
                  <AnimatePresence mode="wait">
                    {/* Password Reset Tab */}
                    {privacySettingsTab === "password" && (
                      <motion.div
                        key="password-tab"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="bg-blue-50 border border-blue-100 p-4 mb-4 rounded-lg"
                      >
                        <p className="text-blue-700">
                          Send a password reset email to this user. They will receive an email with instructions to reset their password.
                        </p>
                      </motion.div>
                    )}

                    {/* PIN Change Tab */}
                    {privacySettingsTab === "pin" && (
                      <motion.div
                        key="pin-tab"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="bg-purple-50 border border-purple-100 p-4 mb-4 rounded-lg">
                          <p className="text-purple-700">
                            Enter a new 4-digit PIN for this user. The PIN will be used for authentication.
                          </p>
                        </div>

                        {pinError && (
                          <div className="bg-red-50 border border-red-100 p-3 mb-4 rounded-lg">
                            <p className="text-red-700 text-sm">{pinError}</p>
                          </div>
                        )}

                        <div className="space-y-4">
                          <div>
                            <label htmlFor="newPin" className="block text-sm font-medium text-gray-700 mb-1">
                              New PIN (4 digits)
                            </label>
                            <input
                              type="text"
                              id="newPin"
                              value={newPin}
                              onChange={(e) => {
                                // Only allow numbers and limit to 4 digits
                                const value = e.target.value;
                                if (/^\d*$/.test(value) && value.length <= 4) {
                                  setNewPin(value);
                                }
                              }}
                              placeholder="Enter 4-digit PIN"
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                              maxLength="4"
                              pattern="\d{4}"
                              inputMode="numeric"
                            />
                          </div>

                          <div>
                            <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-700 mb-1">
                              Confirm PIN
                            </label>
                            <input
                              type="text"
                              id="confirmPin"
                              value={confirmPin}
                              onChange={(e) => {
                                // Only allow numbers and limit to 4 digits
                                const value = e.target.value;
                                if (/^\d*$/.test(value) && value.length <= 4) {
                                  setConfirmPin(value);
                                }
                              }}
                              placeholder="Confirm 4-digit PIN"
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                              maxLength="4"
                              pattern="\d{4}"
                              inputMode="numeric"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Department Change Tab */}
                    {privacySettingsTab === "department" && (
                      <motion.div
                        key="department-tab"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="bg-green-50 border border-green-100 p-4 mb-4 rounded-lg">
                          <p className="text-green-700">
                            Update the department for this user. This will be used for organizational purposes.
                          </p>
                        </div>

                        <div>
                          <label htmlFor="newDepartment" className="block text-sm font-medium text-gray-700 mb-1">
                            Department
                          </label>
                          <motion.div
                            initial={{ opacity: 0.8, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                          >
                            <select
                              id="newDepartment"
                              value={newDepartment}
                              onChange={(e) => {
                                // Animate the selection change
                                const selectElement = document.getElementById('newDepartment');
                                if (selectElement) {
                                  // Add a brief highlight effect
                                  selectElement.classList.add('bg-green-50');
                                  setTimeout(() => {
                                    selectElement.classList.remove('bg-green-50');
                                  }, 300);
                                }
                                setNewDepartment(e.target.value);
                              }}
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white transition-all duration-300 ease-in-out"
                            >
                              <option value="" disabled>Select department</option>
                              <option value="Production">Production</option>
                              <option value="Financial">Financial</option>
                              <option value="Marketing">Marketing</option>
                            </select>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className={`p-4 mb-6 rounded-lg ${
                  actionType === "disable" ? 'bg-orange-50 border border-orange-100' :
                  'bg-green-50 border border-green-100'
                }`}>
                  <p className={`${
                    actionType === "disable" ? 'text-orange-700' :
                    'text-green-700'
                  }`}>
                    {actionType === "disable"
                      ? `Are you sure you want to disable this account? The user will no longer be able to log in.`
                      : `Are you sure you want to enable this account? The user will be able to log in again.`}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <motion.button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-all duration-200 shadow-sm font-medium"
                  whileHover={{ scale: 1.03, boxShadow: "0 4px 8px rgba(0,0,0,0.05)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  {actionResult.message ? 'Close' : 'Cancel'}
                </motion.button>

                {!actionResult.message && (
                  <motion.button
                    onClick={executeAction}
                    disabled={isActionLoading}
                    className={`px-5 py-2 text-white rounded-lg shadow-md transition-all duration-200 font-medium relative ${
                      actionType === "disable"
                        ? 'bg-orange-500 hover:bg-orange-600'
                        : actionType === "enable"
                        ? 'bg-green-500 hover:bg-green-600'
                        : actionType === "privacySettings" && privacySettingsTab === "password"
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : actionType === "privacySettings" && privacySettingsTab === "pin"
                        ? 'bg-purple-500 hover:bg-purple-600'
                        : actionType === "privacySettings" && privacySettingsTab === "department"
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-yellowsm hover:bg-yellow-600'
                    } ${isActionLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
                    whileHover={isActionLoading ? {} : { scale: 1.05, boxShadow: "0 6px 12px rgba(0,0,0,0.1)" }}
                    whileTap={isActionLoading ? {} : { scale: 0.95 }}
                  >
                    {isActionLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      actionType === "privacySettings" && privacySettingsTab === "password"
                        ? "Send Reset Email"
                        : actionType === "privacySettings" && privacySettingsTab === "pin"
                        ? "Update PIN"
                        : actionType === "privacySettings" && privacySettingsTab === "department"
                        ? "Update Department"
                        : "Confirm"
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserAccounts;
