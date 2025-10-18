import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ROUTES } from '../common/constants';
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
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Redirect root to dashboard */}
          <Route
            path={ROUTES.ADMIN.BASE}
            element={<Navigate to={ROUTES.ADMIN.DASHBOARD} replace />}
          />

          {/* Protected routes with Layout */}
          <Route
            element={
              <PrivateRoute>
                <LayoutDashboard />
              </PrivateRoute>
            }
          >
            <Route path={ROUTES.ADMIN.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES.ADMIN.USERS} element={<Users />} />
            <Route
              path={ROUTES.ADMIN.LISTING_AND_ORDERS}
              element={<ListingsAndOrders />}
            />
            <Route path={ROUTES.ADMIN.DISPUTES} element={<Disputes />} />
            <Route path={ROUTES.ADMIN.REPORTS} element={<Report />} />
            <Route
              path={ROUTES.ADMIN.CERTIFICATES}
              element={<Certificates />}
            />
            <Route path={ROUTES.ADMIN.WALLET} element={<Wallet />} />
            <Route path={ROUTES.ADMIN.SETTINGS} element={<Settings />} />
            <Route path={ROUTES.ADMIN.PROFILE} element={<Profile />} />
          </Route>

          {/* 404 - Not Found */}
          <Route path={ROUTES.OTHER.NOT_FOUND} element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRouter;
