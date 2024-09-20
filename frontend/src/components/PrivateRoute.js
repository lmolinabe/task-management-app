import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // Show a loading indicator while checking authentication status
  if (loading) {
    return <div>Loading...</div>; 
  }
    
  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;