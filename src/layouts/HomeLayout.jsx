import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "../components/Home/NavBar";
import Footer from "../components/Home/Footer";
import { useAuth } from "../context/AuthContext";
import { useLoading } from "../context/LoadingContext";

function HomeLayout() {
  const { currentUser, loading: authLoading } = useAuth();
  const { hideLoading } = useLoading();
  const location = useLocation();

  // Hide loading screen when component mounts
  useEffect(() => {
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      hideLoading();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Check if we're on a public page
  const isPublicPage = () => {
    const path = location.pathname;
    return path === "/" ||
           path === "/signin" ||
           path === "/signup" ||
           path === "/privacypolicy" ||
           path === "/contact" ||
           path === "/about" ||
           path === "/terms-and-condition" ||
           path === "/features";
  };

  useEffect(() => {
    // If we're not on a public page and not authenticated, redirect to signin
    if (!authLoading && !currentUser && !isPublicPage()) {
      console.log("Unauthorized access attempt to:", location.pathname);
      window.location.href = "/signin";
    }
  }, [currentUser, authLoading, location.pathname]);

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
    <main className="bg-gradient-to-b from-whitesm from-60% via-yellowf via-95% to-yellowsm to-100% min-h-screen bg-no-repeat bg-fixed max-w-full overflow-x-hidden relative">
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
