import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import LoadingSpinner from '../components/LoadingSpinner';
import PrivateRoute from '../routes/PrivateRoute';

import { ROUTES } from './../common/constants';

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
          <Route path="/" element={<Navigate to={ROUTES.ADMIN.DASHBOARD} />} />

          <Route
            path={ROUTES.ADMIN.DASHBOARD}
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path={ROUTES.ADMIN.LISTING_AND_ORDERS}
            element={
              <PrivateRoute>
                <ListingsAndOrders />
              </PrivateRoute>
            }
          />

          <Route
            path={ROUTES.ADMIN.USERS}
            element={
              <PrivateRoute>
                <Users />
              </PrivateRoute>
            }
          />

          <Route
            path={ROUTES.ADMIN.DISPUTES}
            element={
              <PrivateRoute>
                <Disputes />
              </PrivateRoute>
            }
          />

          <Route
            path={ROUTES.ADMIN.REPORTS}
            element={
              <PrivateRoute>
                <Report />
              </PrivateRoute>
            }
          />

          <Route
            path={ROUTES.ADMIN.CERTIFICATES}
            element={
              <PrivateRoute>
                <Certificates />
              </PrivateRoute>
            }
          />

          <Route
            path={ROUTES.ADMIN.WALLET}
            element={
              <PrivateRoute>
                <Wallet />
              </PrivateRoute>
            }
          />

          <Route
            path={ROUTES.ADMIN.SETTINGS}
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />

          <Route
            path={ROUTES.ADMIN.PROFILE}
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route path={ROUTES.OTHER.NOT_FOUND} element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRouter;
