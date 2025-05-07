import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingScreen from '../components/common/LoadingScreen';

// Create the context
const LoadingContext = createContext();

// Create a provider component
export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading your content...');
  const [loadingTimeout, setLoadingTimeout] = useState(null);
  const location = useLocation();

  // Custom messages based on route
  const getRouteMessage = (pathname) => {
    if (pathname.includes('/dashboard')) {
      return 'Loading your dashboard...';
    } else if (pathname.includes('/orders')) {
      return 'Loading order information...';
    } else if (pathname.includes('/analytics')) {
      return 'Loading analytics data...';
    } else if (pathname.includes('/inventory')) {
      return 'Loading inventory data...';
    } else if (pathname.includes('/customer')) {
      return 'Loading customer information...';
    }
    return 'Loading your content...';
  };

  // Show loading screen on route change
  useEffect(() => {
    // Clear any existing timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }

    // Set loading state
    setIsLoading(true);
    setLoadingMessage(getRouteMessage(location.pathname));

    // Set a minimum loading time to avoid flicker
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Minimum 1 second loading time

    setLoadingTimeout(timeout);

    // Cleanup on unmount
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [location.pathname]);

  // Function to manually show loading
  const showLoading = (message = 'Loading...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  };

  // Function to manually hide loading
  const hideLoading = () => {
    setIsLoading(false);
  };

  // Value to be provided to consumers
  const value = {
    isLoading,
    loadingMessage,
    showLoading,
    hideLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {isLoading && <LoadingScreen message={loadingMessage} />}
      {children}
    </LoadingContext.Provider>
  );
};

// Custom hook for using the loading context
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
