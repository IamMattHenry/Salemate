import React from 'react';
import { motion } from 'framer-motion';
import { FaLock, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AccessDeniedModal = ({ onClose, module }) => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const handleGoToDashboard = () => {
    navigate('/dashboard');
    if (onClose) onClose();
  };

  // Format module name for display
  const formatModuleName = (moduleName) => {
    if (!moduleName) return 'this page';
    return moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-xl p-8 w-96 max-w-full"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <FaLock className="text-red-600 text-xl" />
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Access Denied
        </h2>

        <p className="text-gray-600 mb-6">
          Sorry, as a <span className="font-semibold">{userProfile?.department}</span> department user,
          you don't have permission to access the <span className="font-semibold">{formatModuleName(module)}</span> page.
          Please contact your administrator if you believe this is an error.
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleGoToDashboard}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AccessDeniedModal;
