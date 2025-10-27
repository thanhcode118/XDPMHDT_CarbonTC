// PrivateRoute.jsx - Component để protect các routes cần authentication

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const PrivateRoute = ({ children, roles = [] }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  // Kiểm tra authentication
  if (!isAuthenticated) {
    // Redirect to login page với return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra role nếu có yêu cầu
  if (roles.length > 0 && user) {
    const hasRole = roles.includes(user.roleName);
    if (!hasRole) {
      // Không có quyền truy cập
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default PrivateRoute;