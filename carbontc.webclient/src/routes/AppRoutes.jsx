// src/routes/AppRoutes.jsx

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import ChangePassword from '../pages/ChangePassword';
import UserManagement from '../pages/admin/UserManagement';
import UserDetail from '../pages/admin/UserDetail';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  console.log('🛡️ ProtectedRoute Check:', {
    loading,
    isAuthenticated,
    user: user?.email || 'null'
  });

  // ✅ QUAN TRỌNG: Đợi loading xong
  if (loading) {
    console.log('⏳ Still loading, showing spinner...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ Sau khi loading xong, mới check auth
  if (!isAuthenticated) {
    console.log('❌ Not authenticated → Redirect to /login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ Authenticated → Render content');
  return children;
}

function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  console.log('👑 AdminRoute Check:', {
    loading,
    isAuthenticated,
    role: user?.roleName || 'null'
  });

  // ✅ Đợi loading xong
  if (loading) {
    console.log('⏳ Still loading, showing spinner...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ Check auth
  if (!isAuthenticated) {
    console.log('❌ Not authenticated → Redirect to /login');
    return <Navigate to="/login" replace />;
  }

  // ✅ Check admin role
  if (user?.roleName !== 'Admin') {
    console.log('❌ Not admin → Redirect to /dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ Admin authenticated → Render admin content');
  return children;
}

export default function AppRoutes() {
  console.log('🗺️ AppRoutes rendered');

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:userId"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <UserDetail />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}