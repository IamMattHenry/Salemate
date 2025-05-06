import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const SidebarContext = createContext();

// Create a provider component
export const SidebarProvider = ({ children }) => {
  // Initialize state from localStorage or default to true (minimized)
  const [isMinimized, setIsMinimized] = useState(() => {
    const savedState = localStorage.getItem('sidebarMinimized');
    // If there's a saved state, parse it, otherwise default to true
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  // Toggle function
  const toggleSideNav = () => {
    setIsMinimized(prevState => !prevState);
  };

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('sidebarMinimized', JSON.stringify(isMinimized));
  }, [isMinimized]);

  // Value to be provided to consumers
  const value = {
    isMinimized,
    toggleSideNav
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

// Custom hook for using the sidebar context
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
