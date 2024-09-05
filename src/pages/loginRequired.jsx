// src/pages/LoginRequiredPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginRequiredPage = () => {
  const navigate = useNavigate();

  const handleBackToLanding = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-sky-100 to-white text-center p-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Login Required
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        You need to log in to access this page.
      </p>
      <button
        onClick={handleBackToLanding}
        className="bg-gradient-to-r from-customBiru3 to-customBiru6 text-white py-2 px-6 rounded-full shadow-lg transform transition-transform hover:scale-105"
      >
        Back to Landing
      </button>
    </div>
  );
};

export default LoginRequiredPage;
