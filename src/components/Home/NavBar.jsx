import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const auth = getAuth();

  // Check if we're on the signin or signup page
  const isAuthPage = location.pathname === "/signin" || location.pathname === "/signup";

  // Verify authentication status directly with Firebase
  useEffect(() => {
    // Create a safe reference to handleLogout that won't cause dependency issues
    const handleAuthMismatch = async () => {
      try {
        await logout();
        navigate('/signin');
      } catch (error) {
        console.error("Error logging out during auth check:", error);
        navigate('/signin');
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);

      // If auth state doesn't match context state, force a refresh
      if (!!user !== !!currentUser) {
        console.log("Auth state mismatch detected");
        if (!user && currentUser) {
          // Force logout if Firebase says not authenticated but context says authenticated
          handleAuthMismatch();
        }
      }
    });

    return () => unsubscribe();
  }, [auth, currentUser, logout, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signin');
    } catch (error) {
      console.error("Error logging out:", error);
      // Force navigation even if logout fails
      navigate('/signin');
    }
  };

  return (
    <nav className="z-50 w-full">
      <div className="relative">
        <div className="flex justify-between items-center w-full px-5 py-6.5">
          <h3 className="text-yellowsm md:text-3xl md:ml-5">
            <a href="/">
              <span className="font-redacted font-bold text-5xl -top-1 relative">S </span>
              <span className="font-quicksand font-bold relative -top-2 -left-2">
                salemate
              </span>
            </a>
          </h3>
          <ul className="hidden sm:flex text-black font-heading text-md font-lato space-x-6 font-bold uppercase">
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  isActive
                    ? "py-3 px-7 text-sm rounded-3xl text-yellowsm transition ease-in-out hover:bg-yellowsm hover:text-white border-2 border-yellowsm"
                    : "py-3 px-7 text-sm rounded-3xl text-yellowsm transition ease-in-out hover:bg-yellowsm hover:text-white border-2 border-yellowsm"
                }
              >
                Contact Us
              </NavLink>
            </li>
            {/* Don't show auth buttons on signin/signup pages */}
            {!isAuthPage && (
              isAuthenticated ? (
                <>
                  <li>
                    <NavLink
                      to="/dashboard"
                      className={({ isActive }) =>
                        isActive
                          ? "py-3 px-7 text-sm rounded-3xl text-yellowsm transition ease-in-out hover:bg-yellowsm hover:text-white border-2 border-yellowsm"
                          : "py-3 px-7 text-sm rounded-3xl text-yellowsm transition ease-in-out hover:bg-yellowsm hover:text-white border-2 border-yellowsm"
                      }
                    >
                      Dashboard
                    </NavLink>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="py-3 px-7 rounded-3xl text-whitesm bg-yellowsm transition ease-in-out hover:bg-whitesm hover:text-yellowsm border-2 border-yellowsm text-sm"
                    >
                      Sign Out
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <NavLink
                    to="/signin"
                    className={({ isActive }) =>
                      isActive
                        ? "bg-yellowsm text-whitesm hover:bg-whitesm hover:text-yellowsm py-3 px-7 rounded-3xl transition ease-in-out border-yellowsm text-sm"
                        : "py-3 px-7 rounded-3xl text-whitesm bg-yellowsm transition ease-in-out hover:bg-whitesm hover:text-yellowsm border-2 border-yellowsm text-sm"
                    }
                  >
                    Get Access
                  </NavLink>
                </li>
              )
            )}
          </ul>
          <div className="sm:hidden flex flex-col items-end">
            <button
              id="nav-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="menu-icon text-4xl">☰</span>
            </button>
          </div>
        </div>

        <ul
          id="mobile-menu"
          className={`${
            isMobileMenuOpen ? "block" : "hidden"
          } absolute inset-x-0 top-12 bg-primary py-5 px-7 text-center font-lato text-lg z-50`}
        >
          <li>
            <NavLink
              to="/contact"
              className="block my-3 transition ease-in-out hover:bg-background hover:text-primary rounded-full"
            >
              Contact Us
            </NavLink>
          </li>

          {/* Don't show auth buttons on signin/signup pages */}
          {!isAuthPage && (
            isAuthenticated ? (
              <>
                <li>
                  <NavLink
                    to="/dashboard"
                    className="block my-3 transition ease-in-out hover:bg-background hover:text-primary rounded-full"
                  >
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="block w-full my-3 transition ease-in-out hover:bg-background hover:text-primary rounded-full text-center"
                  >
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <li>
                <NavLink
                  to="/signin"
                  className="block my-3 transition ease-in-out hover:bg-background hover:text-primary rounded-full"
                >
                  Get Access
                </NavLink>
              </li>
            )
          )}
        </ul>
      </div>
    </nav>
  );
}

export default NavBar;
