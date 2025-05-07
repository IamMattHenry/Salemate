import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import AccessDeniedModal from './AccessDeniedModal';
import LoadingSpinner from '../common/LoadingSpinner';

// Extract the module name from the path
const getModuleFromPath = (path) => {
  const modulePath = path.split('/')[1]; // Get the first part of the path

  // Map the path to the corresponding module name
  switch (modulePath) {
    case 'dashboard':
      return 'dashboard';
    case 'orders':
      return 'orders';
    case 'analytics':
      return 'analytics';
    case 'inventory':
      return 'inventory';
    case 'customer':
      return 'customer';
    default:
      return null;
  }
};

const ProtectedRoute = ({ children }) => {
  const { currentUser, pinVerified, hasAccess, loading: authLoading } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const location = useLocation();
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);

  // Get the current module from the path
  const currentModule = getModuleFromPath(location.pathname);

  // Handle loading states
  useEffect(() => {
    if (authLoading) {
      showLoading('Checking authentication...');
      setLocalLoading(true);
    } else {
      // Add a small delay to ensure smooth transitions
      const timer = setTimeout(() => {
        hideLoading();
        setLocalLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [authLoading, location.pathname]);

  // If auth is still loading, show a loading spinner
  if (authLoading || localLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-whitesm from-60% via-yellowf via-95% to-yellowsm to-100%">
        <LoadingSpinner size="large" text="Loading your content..." />
      </div>
    );
  }

  // If user is not logged in, redirect to sign in
  if (!currentUser) {
    console.log("User not authenticated, redirecting to signin");
    // Use window.location for a full page refresh to ensure clean state
    window.location.href = "/signin";
    return null;
  }

  // Check if user has access to this module
  if (currentModule && !hasAccess(currentModule)) {
    return <AccessDeniedModal
      module={currentModule}
      onClose={() => setShowAccessDenied(false)}
    />;
  }

  // If PIN is not verified, the InitialPinVerification component will handle it
  // at the app level, so we don't need to check here

  // If all checks pass, render the children
  return children;
};

export default ProtectedRoute;
