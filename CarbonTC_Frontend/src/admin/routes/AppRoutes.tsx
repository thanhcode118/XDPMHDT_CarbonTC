import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import Admin CSS - AFTER Bootstrap in main.jsx
import '../index.css';
import '../App.css';

import { lightTheme } from '../../common/themes/theme';
import { AuthCallback } from '../components/auth';
import LayoutDashboard from '../components/layouts/layoutDashboard';
import LoadingSpinner from '../components/LoadingSpinner';
import PrivateRoute from '../routes/PrivateRoute';

// Lazy load pages
const Dashboard = lazy(() => import('../pages/cms/Dashboard'));
const ListingsAndOrders = lazy(() => import('../pages/cms/ListingsAndOrders'));
const Users = lazy(() => import('../pages/cms/Users'));
const Disputes = lazy(() => import('../pages/cms/Disputes'));
const Report = lazy(() => import('../pages/cms/Reports'));
const Certificates = lazy(() => import('../pages/cms/Certificates'));
const Wallet = lazy(() => import('../pages/cms/Wallet'));
const Settings = lazy(() => import('../pages/cms/Settings'));
const Profile = lazy(() => import('../pages/cms/Profile'));
const NotFound = lazy(() => import('../pages/cms/NotFound'));

function AppRouter() {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <div className="admin-root">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />

            <Route
              element={
                <PrivateRoute>
                  <LayoutDashboard />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />

              {/* Admin pages */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="listing-and-orders" element={<ListingsAndOrders />} />
              <Route path="disputes" element={<Disputes />} />
              <Route path="reports" element={<Report />} />
              <Route path="certificates" element={<Certificates />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* 404 - Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </ThemeProvider>
  );
}

export default AppRouter;
