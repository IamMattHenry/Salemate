import React, { useEffect } from 'react';

/**
 * A component that intercepts and handles Firebase Auth errors
 * This component should be placed at the top level of your application
 */
const FirebaseErrorHandler = () => {
  useEffect(() => {
    // Store original error handlers
    const originalOnError = window.onerror;
    const originalOnUnhandledRejection = window.onunhandledrejection;

    // Custom error handler for synchronous errors
    window.onerror = function(message, source, lineno, colno, error) {
      // Check if it's a Firebase Auth error
      if (error && error.name === 'FirebaseError' && error.code && error.code.startsWith('auth/')) {
        console.error('Intercepted Firebase Auth error:', error);
        // Prevent default browser error handling
        return true;
      }
      
      // Otherwise, use the original handler
      return originalOnError ? originalOnError(message, source, lineno, colno, error) : false;
    };

    // Custom handler for promise rejections (async errors)
    window.onunhandledrejection = function(event) {
      // Check if it's a Firebase Auth error
      if (event.reason && 
          event.reason.name === 'FirebaseError' && 
          event.reason.code && 
          event.reason.code.startsWith('auth/')) {
        console.error('Intercepted unhandled Firebase Auth rejection:', event.reason);
        // Prevent default browser error handling
        event.preventDefault();
        return true;
      }
      
      // Otherwise, use the original handler
      return originalOnUnhandledRejection ? originalOnUnhandledRejection(event) : false;
    };

    // Also add a direct event listener with capture to ensure we catch the events
    const unhandledRejectionHandler = (event) => {
      if (event.reason && 
          event.reason.name === 'FirebaseError' && 
          event.reason.code && 
          event.reason.code.startsWith('auth/')) {
        console.error('Captured Firebase Auth error via event listener:', event.reason);
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('unhandledrejection', unhandledRejectionHandler, true);

    // Cleanup function
    return () => {
      // Restore original handlers
      window.onerror = originalOnError;
      window.onunhandledrejection = originalOnUnhandledRejection;
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler, true);
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default FirebaseErrorHandler;
