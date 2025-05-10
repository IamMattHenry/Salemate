import React, { useEffect, useState } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "../components/Home/NavBar";
import Footer from "../components/Home/Footer";
import { useAuth } from "../context/AuthContext";
import { useLoading } from "../context/LoadingContext";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function HomeLayout() {
  const { currentUser, loading: authLoading, logout } = useAuth();
  const { hideLoading } = useLoading();
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [authVerified, setAuthVerified] = useState(false);
  const auth = getAuth();

  // Hide loading screen when component mounts
  useEffect(() => {
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      hideLoading();
    }, 500);

    return () => clearTimeout(timer);
  }, [hideLoading]);

  // Check if we're on a public page
  const isPublicPage = () => {
    const path = location.pathname;
    return path === "/signin" ||
           path === "/signup" ||
           path === "/privacypolicy" ||
           path === "/contact" ||
           path === "/about" ||
           path === "/terms-and-condition" ||
           path === "/features";
  };

  // Special case for home page - only public if not logged in
  const isHomePage = location.pathname === "/";

  // Verify authentication status directly with Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthVerified(!!user);

      // If no user is authenticated but currentUser exists in context
      // This means the session is invalid - force logout
      if (!user && currentUser && !authLoading) {
        console.log("Invalid session detected, logging out");
        logout();
      }
    });

    return () => unsubscribe();
  }, [auth, currentUser, authLoading, logout]);

  // Handle page visibility changes (tab/window close)
  useEffect(() => {
    // We'll use a combination of events to detect actual page close vs tab switching
    let isClosing = false;

    // When the page is about to unload (close), mark it as closing
    const handleBeforeUnload = () => {
      isClosing = true;
    };

    // When visibility changes, check if it's a page close or just tab switching
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Start a timer - if the page becomes visible again before the timer completes,
        // it was just a tab switch, not a page close
        setTimeout(() => {
          // Only log out if the page is still hidden after the timeout
          // and we detected a beforeunload event (actual page close)
          if (document.visibilityState === 'hidden' && isClosing && currentUser) {
            console.log("Page close detected, logging out for security");
            logout();
          }
        }, 500); // Short timeout to differentiate between tab switch and page close
      } else if (document.visibilityState === 'visible') {
        // User returned to the page, reset the closing flag
        isClosing = false;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [logout, currentUser]);

  useEffect(() => {
    // If we're not on a public page and not authenticated, redirect to signin
    if (!authLoading && !authVerified) {
      if (!isPublicPage() && !isHomePage) {
        console.log("Unauthorized access attempt to:", location.pathname);
        setShouldRedirect(true);
      } else if (isHomePage && currentUser && !authVerified) {
        // Special case: Home page with invalid auth state
        console.log("Invalid auth state on home page, redirecting");
        setShouldRedirect(true);
      } else {
        setShouldRedirect(false);
      }
    } else {
      setShouldRedirect(false);
    }
  }, [currentUser, authLoading, authVerified, location.pathname, isHomePage]);

  // If we need to redirect, use the Navigate component
  if (shouldRedirect) {
    return <Navigate to="/signin" replace />;
  }

  // Page transition variants
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    in: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <main className="bg-gradient-to-b from-whitesm from-60% via-yellowf via-95% to-yellowsm to-100% min-h-screen bg-no-repeat bg-fixed max-w-full overflow-hidden relative">
      <NavBar />

      {/* Animated page transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="in"
          exit="exit"
          variants={pageVariants}
          className="min-h-[calc(100vh-200px)]"
        >
          <Outlet /> {/*children*/}
        </motion.div>
      </AnimatePresence>

      <Footer />
    </main>
  );
}

export default HomeLayout;
