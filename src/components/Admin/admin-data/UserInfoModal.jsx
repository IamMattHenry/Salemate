import React from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { FaUserShield } from 'react-icons/fa';

const UserInfoModal = ({ 
  showModal, 
  user, 
  onClose, 
  onPrivacySettings, 
  onDisable, 
  onEnable 
}) => {
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
                User Information
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

            {/* User profile section */}
            <m.div 
              className="flex flex-col items-center mb-6 relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative mb-4 group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-amber-400/70 rounded-full blur-md opacity-50 group-hover:opacity-70 transition-all duration-300"></div>
                <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-amber-200 shadow-lg relative">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={`${user.firstName || ''} ${user.lastName || ''}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 text-amber-500">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {user.disabled && (
                  <m.span 
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    Disabled
                  </m.span>
                )}
              </div>

              <m.h2 
                className="text-xl font-bold text-gray-800 mb-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {user.firstName || ''} {user.lastName || ''}
              </m.h2>
              <m.div 
                className="text-sm text-gray-600 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                {user.email}
              </m.div>
              <m.div 
                className="bg-gradient-to-r from-amber-50 to-amber-100/80 px-3 py-1.5 rounded-full text-amber-700 text-sm font-medium border border-amber-200/50 shadow-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 4px 12px rgba(251, 191, 36, 0.15)",
                  backgroundColor: "rgba(251, 191, 36, 0.2)"
                }}
              >
                {user.formattedUserId}
              </m.div>
            </m.div>

            {/* User details grid */}
            <m.div 
              className="grid grid-cols-2 gap-3 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <m.div 
                className="bg-gradient-to-br from-white to-amber-50 p-3 rounded-lg border border-amber-100/50 shadow-sm hover:shadow-md transition-all duration-300"
                whileHover={{ y: -2, boxShadow: "0 6px 12px rgba(0,0,0,0.05)" }}
              >
                <div className="text-xs text-gray-500 mb-1">Department</div>
                <div className="text-sm font-medium text-gray-700">
                  {user.department || 'Not set'}
                </div>
              </m.div>
              
              <m.div 
                className="bg-gradient-to-br from-white to-amber-50 p-3 rounded-lg border border-amber-100/50 shadow-sm hover:shadow-md transition-all duration-300"
                whileHover={{ y: -2, boxShadow: "0 6px 12px rgba(0,0,0,0.05)" }}
              >
                <div className="text-xs text-gray-500 mb-1">PIN</div>
                <div className="text-sm font-medium text-gray-700">
                  {user.pin ? '••••' : 'Not set'}
                </div>
              </m.div>
              
              <m.div 
                className="bg-gradient-to-br from-white to-amber-50 p-3 rounded-lg border border-amber-100/50 shadow-sm hover:shadow-md transition-all duration-300"
                whileHover={{ y: -2, boxShadow: "0 6px 12px rgba(0,0,0,0.05)" }}
              >
                <div className="text-xs text-gray-500 mb-1">Created</div>
                <div className="text-sm font-medium text-gray-700">
                  {user.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                </div>
              </m.div>
              
              <m.div 
                className="bg-gradient-to-br from-white to-amber-50 p-3 rounded-lg border border-amber-100/50 shadow-sm hover:shadow-md transition-all duration-300"
                whileHover={{ y: -2, boxShadow: "0 6px 12px rgba(0,0,0,0.05)" }}
              >
                <div className="text-xs text-gray-500 mb-1">Last Sign In</div>
                <div className="text-sm font-medium text-gray-700">
                  {user.lastSignIn ? formatDate(user.lastSignIn) : 'Never'}
                </div>
              </m.div>
            </m.div>

            {/* Action buttons */}
            <m.div 
              className="flex justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <m.button
                onClick={onPrivacySettings}
                className="flex-1 mr-2 py-2.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white rounded-lg shadow-md transition-all duration-200 relative overflow-hidden group"
                whileHover={{ 
                  scale: 1.03, 
                  boxShadow: "0 6px 12px rgba(251, 191, 36, 0.25)" 
                }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-300/0 via-amber-300/30 to-amber-300/0 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                <div className="flex items-center justify-center relative z-10">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Privacy Settings
                </div>
              </m.button>

              {user.disabled ? (
                <m.button
                  onClick={onEnable}
                  className="flex-1 ml-2 py-2.5 px-4 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-lg shadow-md transition-all duration-200 relative overflow-hidden group"
                  whileHover={{ 
                    scale: 1.03, 
                    boxShadow: "0 6px 12px rgba(34, 197, 94, 0.25)" 
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-300/0 via-green-300/30 to-green-300/0 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                  <div className="flex items-center justify-center relative z-10">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Enable Account
                  </div>
                </m.button>
              ) : (
                <m.button
                  onClick={onDisable}
                  className="flex-1 ml-2 py-2.5 px-4 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white rounded-lg shadow-md transition-all duration-200 relative overflow-hidden group"
                  whileHover={{ 
                    scale: 1.03, 
                    boxShadow: "0 6px 12px rgba(249, 115, 22, 0.25)" 
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-300/0 via-orange-300/30 to-orange-300/0 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                  <div className="flex items-center justify-center relative z-10">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Disable Account
                  </div>
                </m.button>
              )}
            </m.div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default UserInfoModal;
