import { FloatingLabel } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/image/logo.png";
import React, { useEffect, useState } from 'react';
import '../assets/style.css';
import axios from 'axios';

const colors = [
  'bg-red-500',
  'bg-blue-500',
  'customBiru2',
  'bg-yellow-500',
  'bg-purple-500'
];

const Registration = () => {
  const [activeColors, setActiveColors] = useState([]);
  const [cursorPosition, setCursorPosition] = useState({ x: -100, y: -100 });
  const navigate = useNavigate();
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveColors(prevColors => {
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

  const handleSignUpButton = async (e) => {
    e.preventDefault();

    // Validate email format
    if (!validateEmail(email)) {
      return setMessage('Please enter a valid email address.');
    }

    // Validate password match
    if (password !== retypePassword) {
      return setMessage('Passwords do not match.');
    }

    try {
      const response = await axios.post('http://localhost:5000/register', {
        fullname,
        email,
        password,
        retype_password: retypePassword  // Match the backend field name
      });

      if (response.data.result === 'success') {
        setMessage('Registration successful! Please Log In.');
        setTimeout(() => {
          window.location.href = '/login';  // Redirect to login page
        }, 2000);  // Redirect after 2 seconds
      } else {
        setMessage(response.data.msg || 'Registration failed.');
      }
    } catch (error) {
      setMessage(error.response?.data?.msg || 'An error occurred');
    }
  };

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center from-sky-100 to-white" onMouseMove={handleMouseMove}>
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
              ...(cursorPosition.x !== -100 && cursorPosition.y !== -100 ? {
                top: `${cursorPosition.y}px`,
                left: `${cursorPosition.x}px`,
                transform: 'translate(-50%, -50%) scale(1.5)',
                transition: 'top 0.2s ease, left 0.2s ease'
              } : {})
            }}
          ></div>
        ))}
      </div>

      <div className="relative from-sky-100 to-white p-10 rounded-lg shadow-2xl w-full max-w-sm bg-white z-10">
        <div className="flex justify-center mb-4">
          <img src={Logo} alt="InterviewGo Logo" className="h-20" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">InterviewGo!</h1>
        <h2 className="text-lg text-center mb-6">
          <span className="font-medium">Join TODAY</span> and Ace Every
          Interview
        </h2>
        {message && <p className="text-center text-red-500">{message}</p>}
        <form className="space-y-4"onSubmit={handleSignUpButton}>
          <div>
            <div className="mt-8">
              <FloatingLabel
                variant="standard"
                label="Fullname"
                id="fullname"
                name="fullname"
                type="text"
                required
                className="focus:ring-customBiru2-500 focus:border-customBiru2-500"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
              />
            </div>
            <div className="mt-6">
              <FloatingLabel
                variant="standard"
                label="Email"
                id="email"
                name="email"
                type="email"
                required
                className="focus:ring-customBiru2-500 focus:border-customBiru2-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mt-6">
              <FloatingLabel
                variant="standard"
                label="Re-Type Password"
                id="retype-password"
                name="retype-password"
                type="password"
                required
                className="focus:ring-customBiru2-500 focus:border-customBiru2-500"
                value={retypePassword}
                onChange={(e) => setRetypePassword(e.target.value)}
              />
            </div>
          </div>
          <div>
            <button
              onClick={handleSignUpButton}
              className="mt-8 w-full flex justify-center bg-gradient-to-r from-customBiru3 to-customBiru6 text-white py-3 px-8 rounded-full shadow-lg transform transition-transform hover:scale-105 hover:from-customBiru4 hover:to-customBiru3"
            >
              Sign Up
            </button>
          </div>
          <div className="text-center pt-2">
            Already have an account?
            <a
              href="/login"
              className="text-sm text-cyan-700 hover:underline dark:text-cyan-500"
            >
              {" "}
              Log in Here
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Registration;