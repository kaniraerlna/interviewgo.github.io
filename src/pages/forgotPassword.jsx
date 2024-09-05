import { FloatingLabel, Checkbox, Label } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/image/logo.png";
import React, { useEffect, useState } from "react";
import "../assets/style.css";
import { AnimatePresence, motion } from "framer-motion";
import { FiAlertCircle } from "react-icons/fi";

const colors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
];

const ForgotPassword = () => {
  const [activeColors, setActiveColors] = useState([]);
  const [cursorPosition, setCursorPosition] = useState({ x: -100, y: -100 });
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveColors((prevColors) => {
        const newColors = [...prevColors];
        if (newColors.length >= 5) {
          newColors.shift();
        }
        newColors.push(colors[Math.floor(Math.random() * colors.length)]);
        return newColors;
      });
    }, 6000); // Interval pembaruan setiap 6 detik

    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
  };

  const handleSignInButton = () => {
    navigate("/login");
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center from-sky-100 to-white"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        {activeColors.map((color, index) => (
          <div
            key={index}
            className={`absolute h-40 w-40 ${color} opacity-75 rounded-full blur-3xl transition-transform duration-3000 ease-in-out`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `translate(-50%, -50%) scale(0)`,
              animation: `pulse-${index} 8s infinite`,
              ...(cursorPosition.x !== -100 && cursorPosition.y !== -100
                ? {
                    top: `${cursorPosition.y}px`,
                    left: `${cursorPosition.x}px`,
                    transform: "translate(-50%, -50%) scale(1.5)",
                    transition: "top 0.2s ease, left 0.2s ease",
                  }
                : {}),
            }}
          ></div>
        ))}
      </div>

      <div className="from-sky-100 to-white p-10 rounded-lg shadow-2xl w-full max-w-sm bg-white z-10">
        <div className="flex justify-center mb-4">
          <img src={Logo} alt="InterviewGo Logo" className="h-20" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">InterviewGo!</h1>
        <h2 className="text-lg text-center mb-6">Reset Your Password Here</h2>
        <form className="space-y-4">
          <div>
            <div className="mt-6">
              <FloatingLabel
                variant="standard"
                label="Email"
                id="email"
                name="email"
                type="email"
                required
                className="focus:ring-customBiru2-500 focus:border-customBiru2-500"
              />
            </div>
            <div className="mt-6">
              <FloatingLabel
                variant="standard"
                label="Password"
                id="password"
                name="password"
                type="password"
                required
                className="focus:ring-customBiru2-500 focus:border-customBiru2-500"
              />
            </div>
          </div>
          <div className="flex gap-4 font-semibold">
            <button
              onClick={handleSignInButton}
              className="mt-10 w-full flex justify-center bg-gray-300 text-red-500 py-3 px-8 rounded-full shadow-lg transform transition-transform hover:scale-105 hover:text-red-600"
            >
              Cancel
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="mt-10 w-full flex justify-center bg-gradient-to-r from-customBiru3 to-customBiru6 text-white py-3 px-8 rounded-full shadow-lg transform transition-transform hover:scale-105 hover:from-customBiru4 hover:to-customBiru3"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
      <SpringModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
};

const SpringModal = ({ isOpen, setIsOpen }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0, rotate: "12.5deg" }}
            animate={{ scale: 1, rotate: "0deg" }}
            exit={{ scale: 0, rotate: "0deg" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-customBiru6 to-customBiru3 text-white p-6 rounded-lg w-full max-w-lg shadow-xl cursor-default relative overflow-hidden"
          >
            <FiAlertCircle className="text-white/10 rotate-12 text-[250px] absolute z-0 -top-24 -left-24" />
            <div className="relative z-10">
              <div className="bg-white w-16 h-16 mb-2 rounded-full text-3xl text-customBiru3 grid place-items-center mx-auto">
                <FiAlertCircle />
              </div>
              <h3 className="text-3xl font-bold text-center mb-2">
                One more thing!
              </h3>
              <p className="text-center mb-6">
                Are you sure want to update your profile setting?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-transparent hover:bg-white/10 transition-colors text-white font-semibold w-full py-2 rounded"
                >
                  Nah, go back
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-white hover:opacity-90 transition-opacity text-customBiru3 font-semibold w-full py-2 rounded"
                >
                  Understood!
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ForgotPassword;
