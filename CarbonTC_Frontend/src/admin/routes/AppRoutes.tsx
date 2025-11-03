import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ROUTES, toRelative } from '../../common/constants';
import { AuthCallback, RedirectToLogin } from '../components/auth';
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
    // <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Redirect root to dashboard */}
          {/* <Route path={ROUTES.ADMIN.BASE} element={<RedirectToLogin />} /> */}
          {/* <Route index element={<RedirectToLogin />} /> */}

          {/* Auth callback route */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected routes with Layout */}
          <Route
            element={
              <PrivateRoute>
                <LayoutDashboard />
              </PrivateRoute>
            }
          >
            {/* <Route path="/admin/dashboard" element={<Dashboard />} /> */}
            <Route index element={<Navigate to={toRelative(ROUTES.ADMIN.DASHBOARD)} replace />} />

            {/* <Route path={toRelative(ROUTES.ADMIN.DASHBOARD)} element={<Dashboard />} /> */}
            <Route path={toRelative(ROUTES.ADMIN.USERS)} element={<Users />} />
            <Route
              path={toRelative(ROUTES.ADMIN.LISTING_AND_ORDERS)}
              element={<ListingsAndOrders />}
            />
            <Route path={toRelative(ROUTES.ADMIN.DISPUTES)} element={<Disputes />} />
            <Route path={toRelative(ROUTES.ADMIN.REPORTS)} element={<Report />} />
            <Route
              path={toRelative(ROUTES.ADMIN.CERTIFICATES)}
              element={<Certificates />}
            />
            <Route path={toRelative(ROUTES.ADMIN.WALLET)} element={<Wallet />} />
            <Route path={toRelative(ROUTES.ADMIN.SETTINGS)} element={<Settings />} />
            <Route path={toRelative(ROUTES.ADMIN.PROFILE)} element={<Profile />} />
          </Route>

          {/* 404 - Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    // </BrowserRouter>
  );
}

export default AppRouter;
