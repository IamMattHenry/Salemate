import React, { useState, useEffect } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { FaUserShield } from 'react-icons/fa';
import { sendPasswordResetEmail } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

const PrivacySettingsModal = ({ 
  showModal, 
  user, 
  onClose, 
  auth,
  db,
  onActionComplete
}) => {
  const [activeTab, setActiveTab] = useState("password");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [actionResult, setActionResult] = useState({ success: false, message: "" });

  // Set department to current value when user changes
  useEffect(() => {
    if (user) {
      setNewDepartment(user.department || "Production");
    }
  }, [user]);

  // Reset fields when opening the modal
  useEffect(() => {
    if (showModal) {
      setActiveTab("password");
      setNewPin("");
      setConfirmPin("");
      setPinError("");
      setActionResult({ success: false, message: "" });
    }
  }, [showModal]);

  const handlePasswordReset = async () => {
    if (!user || !user.email) return;
    
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setActionResult({
        success: true,
        message: `Password reset email sent to ${user.email}`
      });
      
      // Notify parent component
      if (onActionComplete) {
        onActionComplete({
          type: "password",
          success: true,
          message: `Password reset email sent to ${user.email}`
        });
      }
    } catch (error) {
      console.error("Error sending password reset:", error);
      setActionResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinChange = async () => {
    if (!user) return;
    
    // Validate PIN
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setPinError("PIN must be exactly 4 digits");
      return;
    }
    
    if (newPin !== confirmPin) {
      setPinError("PINs do not match");
      return;
    }
    
    setIsLoading(true);
    setPinError("");
    
    try {
      await updateDoc(doc(db, "users", user.id), {
        pin: newPin
      });
      
      setActionResult({
        success: true,
        message: "PIN updated successfully"
      });
      
      // Notify parent component
      if (onActionComplete) {
        onActionComplete({
          type: "pin",
          success: true,
          message: "PIN updated successfully"
        });
      }
    } catch (error) {
      console.error("Error updating PIN:", error);
      setActionResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDepartmentChange = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      await updateDoc(doc(db, "users", user.id), {
        department: newDepartment
      });
      
      setActionResult({
        success: true,
        message: `Department updated to ${newDepartment}`
      });
      
      // Notify parent component
      if (onActionComplete) {
        onActionComplete({
          type: "department",
          success: true,
          message: `Department updated to ${newDepartment}`
        });
      }
    } catch (error) {
      console.error("Error updating department:", error);
      setActionResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeAction = async () => {
    if (activeTab === "password") {
      await handlePasswordReset();
    } else if (activeTab === "pin") {
      await handlePinChange();
    } else if (activeTab === "department") {
      await handleDepartmentChange();
    }
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      {showModal && (
        <m.div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <m.div
            className="bg-gradient-to-br from-white via-amber-50/30 to-amber-100/20 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 border border-amber-100/50 overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              duration: 0.4
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative elements */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-200/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-300/10 rounded-full blur-2xl"></div>
            
            {/* Header with close button */}
            <div className="flex justify-between items-center mb-6 relative">
              <m.h3 
                className="text-xl font-bold text-gray-800"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Privacy Settings
              </m.h3>
              <m.button
                onClick={onClose}
                className="text-gray-500 hover:text-amber-600 p-2 rounded-full hover:bg-amber-50/80 transition-all duration-200"
                whileHover={{ scale: 1.1, backgroundColor: "rgba(251, 191, 36, 0.2)" }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </m.button>
            </div>

            {/* User info */}
            {user && (
              <m.div 
                className="mb-4 flex items-center bg-amber-50/50 p-4 rounded-xl border border-amber-100/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {user.profilePicture ? (
                  <div className="h-12 w-12 rounded-full overflow-hidden mr-4 border-2 border-amber-200 flex-shrink-0 shadow-sm">
                    <img
                      src={user.profilePicture}
                      alt={`${user.firstName || ''} ${user.lastName || ''}`}
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
                    {user.formattedUserId}
                  </span>
                  <span className="text-sm text-gray-700 font-medium">{user.email}</span>
                  {(user.firstName || user.lastName) && (
                    <span className="text-xs text-gray-500 mt-0.5">
                      {user.firstName || ''} {user.lastName || ''}
                    </span>
                  )}
                </div>
              </m.div>
            )}

            <div className="mb-6">
              {/* Tabs for Privacy Settings */}
              <div className="flex border-b border-amber-200/30 mb-6 relative">
                <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 w-full opacity-30"></div>
                <m.button
                  className={`py-2.5 px-4 font-medium text-sm rounded-t-lg relative ${
                    activeTab === "password"
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-blue-500'
                  }`}
                  onClick={() => setActiveTab("password")}
                  whileHover={activeTab !== "password" ? { y: -2 } : {}}
                >
                  {activeTab === "password" && (
                    <m.div 
                      className="absolute bottom-0 left-0 h-0.5 bg-blue-500 w-full"
                      layoutId="tabIndicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  Reset Password
                </m.button>
                <m.button
                  className={`py-2.5 px-4 font-medium text-sm rounded-t-lg relative ${
                    activeTab === "pin"
                      ? 'text-purple-600'
                      : 'text-gray-500 hover:text-purple-500'
                  }`}
                  onClick={() => setActiveTab("pin")}
                  whileHover={activeTab !== "pin" ? { y: -2 } : {}}
                >
                  {activeTab === "pin" && (
                    <m.div 
                      className="absolute bottom-0 left-0 h-0.5 bg-purple-500 w-full"
                      layoutId="tabIndicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  Change PIN
                </m.button>
                <m.button
                  className={`py-2.5 px-4 font-medium text-sm rounded-t-lg relative ${
                    activeTab === "department"
                      ? 'text-green-600'
                      : 'text-gray-500 hover:text-green-500'
                  }`}
                  onClick={() => setActiveTab("department")}
                  whileHover={activeTab !== "department" ? { y: -2 } : {}}
                >
                  {activeTab === "department" && (
                    <m.div 
                      className="absolute bottom-0 left-0 h-0.5 bg-green-500 w-full"
                      layoutId="tabIndicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  Change Department
                </m.button>
              </div>

              {/* Tab Content with Animation */}
              <AnimatePresence mode="wait">
                {/* Password Reset Tab */}
                {activeTab === "password" && (
                  <m.div
                    key="password-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100/30 p-4 mb-4 rounded-lg border border-blue-100/50 shadow-sm">
                      <p className="text-blue-700">
                        Send a password reset email to this user. They will receive an email with instructions to reset their password.
                      </p>
                    </div>
                  </m.div>
                )}

                {/* PIN Change Tab */}
                {activeTab === "pin" && (
                  <m.div
                    key="pin-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100/30 p-4 mb-4 rounded-lg border border-purple-100/50 shadow-sm">
                      <p className="text-purple-700">
                        Enter a new 4-digit PIN for this user. The PIN will be used for authentication.
                      </p>
                    </div>

                    {pinError && (
                      <m.div 
                        className="bg-red-50 border border-red-100 p-3 mb-4 rounded-lg"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="text-red-700 text-sm">{pinError}</p>
                      </m.div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New PIN</label>
                        <m.input
                          type="text"
                          maxLength={4}
                          value={newPin}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value) && value.length <= 4) {
                              setNewPin(value);
                              setPinError("");
                            }
                          }}
                          className="w-full px-4 py-2.5 rounded-lg border border-purple-200 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-all duration-200 shadow-sm"
                          placeholder="Enter 4-digit PIN"
                          whileFocus={{ scale: 1.01, boxShadow: "0 0 0 3px rgba(167, 139, 250, 0.2)" }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm PIN</label>
                        <m.input
                          type="text"
                          maxLength={4}
                          value={confirmPin}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value) && value.length <= 4) {
                              setConfirmPin(value);
                              setPinError("");
                            }
                          }}
                          className="w-full px-4 py-2.5 rounded-lg border border-purple-200 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-all duration-200 shadow-sm"
                          placeholder="Confirm 4-digit PIN"
                          whileFocus={{ scale: 1.01, boxShadow: "0 0 0 3px rgba(167, 139, 250, 0.2)" }}
                        />
                      </div>
                    </div>
                  </m.div>
                )}

                {/* Department Change Tab */}
                {activeTab === "department" && (
                  <m.div
                    key="department-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="bg-gradient-to-r from-green-50 to-green-100/30 p-4 mb-4 rounded-lg border border-green-100/50 shadow-sm">
                      <p className="text-green-700">
                        Select a new department for this user. This will change their access permissions.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <m.select
                        value={newDepartment}
                        onChange={(e) => setNewDepartment(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-green-200 focus:border-green-400 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-all duration-200 shadow-sm"
                        whileFocus={{ scale: 1.01, boxShadow: "0 0 0 3px rgba(74, 222, 128, 0.2)" }}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Production">Production</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Financial">Financial</option>
                      </m.select>
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action result message */}
            <AnimatePresence>
              {actionResult.message && (
                <m.div
                  className={`p-4 mb-4 rounded-lg ${
                    actionResult.success
                      ? 'bg-green-50 border border-green-100'
                      : 'bg-red-50 border border-red-100'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <p className={`${
                    actionResult.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {actionResult.message}
                  </p>
                </m.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="flex justify-end">
              <m.button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg mr-2 transition-all duration-200"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Cancel
              </m.button>

              {!actionResult.message && (
                <m.button
                  onClick={executeAction}
                  disabled={isLoading}
                  className={`px-5 py-2.5 text-white rounded-xl shadow-md transition-all duration-200 font-medium relative overflow-hidden ${
                    activeTab === "password"
                      ? 'bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600'
                      : activeTab === "pin"
                      ? 'bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600'
                      : 'bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600'
                  } ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
                  whileHover={isLoading ? {} : { 
                    scale: 1.05, 
                    boxShadow: activeTab === "password" 
                      ? "0 6px 12px rgba(59, 130, 246, 0.25)" 
                      : activeTab === "pin"
                      ? "0 6px 12px rgba(139, 92, 246, 0.25)"
                      : "0 6px 12px rgba(34, 197, 94, 0.25)"
                  }}
                  whileTap={isLoading ? {} : { scale: 0.95 }}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    activeTab === "password"
                      ? "Send Reset Email"
                      : activeTab === "pin"
                      ? "Update PIN"
                      : "Update Department"
                  )}
                </m.button>
              )}
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default PrivacySettingsModal;
