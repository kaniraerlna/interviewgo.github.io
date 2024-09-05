import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

// Create Context
const AuthContext = createContext();

// Provide Context
const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: !!localStorage.getItem('token'),
    token: localStorage.getItem('token') || null,
  });

  const login = (token) => {
    localStorage.setItem('token', token);
    setAuth({
      isAuthenticated: true,
      token,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth({
      isAuthenticated: false,
      token: null,
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use Auth context
const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth, AuthContext };