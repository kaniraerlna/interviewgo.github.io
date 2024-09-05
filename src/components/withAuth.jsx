import React from 'react';
import { Navigate } from 'react-router-dom';

const withAuth = (WrappedComponent) => {
  const AuthWrapper = (props) => {
    const token = localStorage.getItem('token');
    const tokenExpiration = localStorage.getItem('tokenExpiration');
    
    // Debugging log
    console.log('Token:', token);
    console.log('Token Expiration:', tokenExpiration);
    console.log('Current Time:', new Date().getTime());

    const isAuthenticated = token && tokenExpiration && new Date().getTime() < Number(tokenExpiration);

    if (!isAuthenticated) {
      return <Navigate to="/login-required" />;
    }

    return <WrappedComponent {...props} />;
  };

  return AuthWrapper;
};

export default withAuth;
