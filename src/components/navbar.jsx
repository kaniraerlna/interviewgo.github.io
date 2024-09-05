import React, { useState, useEffect } from 'react';
import monye from "../assets/image/monye.png";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleSignupButton = () => {
    navigate("/registration");
  };

  const handleProfileButton = () => {
    navigate("/profile");
  };

  const handleLoginButton = () => {
    navigate("/login");
    // Simulating login for demonstration
    // setIsAuthenticated(true); // Uncomment this if you want to simulate login
  };

  const handleLogoutButton = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found for logout');
        return;
      }
  
      const response = await fetch('http://localhost:5000/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
  
      if (response.ok) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setShowLogoutConfirm(false);
        navigate("/");
      } else {
        const errorMessage = await response.text();
        console.error('Failed to logout:', errorMessage);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
 

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <nav className="justify-center bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <img
              src={monye}
              alt="Logo"
              className="inline-block pl-5 mr-2 h-12"
            />
          </div>
          <div className="hidden md:flex md:space-x-8 md:items-center">
            <ul className="flex navbar gap-8">
              <li className="nav-item">
                <a href="#" className="text-black hover:underline">
                  HOME
                </a>
              </li>
              <li className="nav-item">
                <a href="/about" className="text-black hover:underline">
                  ABOUT
                </a>
              </li>
              <li className="nav-item">
                <FlyoutLink href="/dashboard" FlyoutContent={FeaturesContent}>
                  FEATURES
                </FlyoutLink>
              </li>
              <li className="nav-item">
                <a href="/pricing" className="text-black hover:underline">
                  PRICING
                </a>
              </li>
            </ul>
          </div>
          <div className="group space-x-2 hidden md:flex md:items-center w-52">
            {isAuthenticated ? (
              <>
                <button
                  onClick={handleProfileButton}
                  className="font-semibold w-72 h-12 hover:underline hover:bg-secondaryGrey duration-500"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogoutButton}
                  className="flex align-middle justify-center font-semibold w-full py-1 px-4 border-2 border-customBiru3 rounded-full shadow-lg transform transition-transform hover:scale-105"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSignupButton}
                  className="font-semibold w-72 h-12 hover:underline hover:bg-secondaryGrey duration-500"
                >
                  Sign Up
                </button>
                <p className="text-gray-300"> / </p>
                <button
                  onClick={handleLoginButton}
                  className="flex align-middle justify-center font-semibold w-full py-1 px-4 border-2 border-customBiru3 rounded-full shadow-lg transform transition-transform hover:scale-105"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 20"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="mr-2 mt-1"
                  >
                    <path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13Z"></path>
                  </svg>
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {showLogoutConfirm && (
        <LogoutConfirmPopup
          onConfirm={confirmLogout}
          onCancel={handleLogoutCancel}
        />
      )}
    </nav>
  );
};

const FlyoutLink = ({ children, href, FlyoutContent }) => {
  const [open, setOpen] = useState(false);

  const showFlyout = FlyoutContent && open;

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="relative nav-item"
    >
      <a href={href} className="text-black hover:underline">
        {children}
      </a>
      <AnimatePresence>
        {showFlyout && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            style={{ translateX: "-50%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute left-1/2 top-12 bg-white text-black"
          >
            <div className="absolute -top-6 left-0 right-0 h-6 bg-transparent" />
            <FlyoutContent />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FeaturesContent = () => {
  const [isLanding, setIsLanding] = useState(true);
  
  return (
    <div className="w-64 bg-white p-6 shadow-xl">
        <div className="mb-3 space-y-3">
          <h3 className="font-semibold">Our Services</h3>
          <a href="/history" className="block text-sm hover:underline">
            <i className="ri-mic-line mx-2"></i>
            Interview Test
          </a>
          <a href="/chatbot" className="block text-sm hover:underline">
            <i className="ri-chat-smile-3-fill mx-2"></i>
            MonBot
          </a>
        </div>
    </div>
  );
};

const LogoutConfirmPopup = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-white p-6 rounded-lg shadow-lg"
      >
        <h3 className="mb-4 text-lg font-semibold text-gray-800 text-center">Are you sure you want to logout?</h3>
        <div className="flex justify-center mt-6">
          <button
            onClick={onConfirm}
            className="flex justify-center font-medium text-sm bg-gradient-to-r from-red-500 to-red-700 text-white rounded-full shadow-lg hover:from-red-600 hover:to-red-800 px-5 py-2.5 me-2 mb-2"
          >
            Yes
          </button>
          <button
            onClick={onCancel}
            className="flex justify-center font-medium text-sm bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 rounded-full shadow-lg hover:from-gray-400 hover:to-gray-500 px-5 py-2.5 ms-2 mb-2"
          >
            No
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Navbar;