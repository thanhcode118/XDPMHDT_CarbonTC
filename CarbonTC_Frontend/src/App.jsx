// src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import AOS from 'aos';

// Import layout & pages
import Layout from './components/layout/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import Marketplace from './pages/Marketplace/Marketplace.jsx';
import Vehicles from './pages/Vehicles/Vehicles.jsx';
import Trips from './pages/Trips/Trips.jsx';
import Wallet from './pages/Wallet/Wallet.jsx';
import Transactions from './pages/Transactions/Transactions.jsx';
import Reports from './pages/Reports/Reports.jsx';
import SettingsTabs from './pages/Settings/Settings.jsx';
import Login from './pages/Login/Login.jsx'; // ✅ Trang Login
import Register from './pages/Register/Register.jsx'; // ✅ Trang Login

// --- IMPORT PRIVATE ROUTE ---
import PrivateRoute from './components/PrivateRoute.jsx';

// Hook thông báo
import { useNotification } from './hooks/useNotification';

function App() {
  const { NotificationComponent, showNotification } = useNotification();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);

  return (
    <>
      {/* Component hiển thị thông báo toàn cục */}
      <NotificationComponent />

      <Routes>
        {/* =================== NHÓM 1: TRANG PUBLIC =================== */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* ✅ Trang Đăng nhập */}
        <Route path="/login" element={<Login />} />
        
        {/* ✅ Trang Đăng ký */}
        <Route path="/register" element={<Register />} />

        {/* =================== NHÓM 2: DASHBOARD =================== */}
      <Route 
          element={
            <PrivateRoute 
              roles={['EVOwner', 'CVA']} // Chỉ định các vai trò được phép
            />
          }
        ></Route>
          <Route
            path="/dashboard"
            element={<Dashboard showNotification={showNotification} />}
          />
          <Route
            path="/marketplace"
            element={<Marketplace showNotification={showNotification} />}
          />
          <Route
            path="/dashboard/trips"
            element={<Trips showNotification={showNotification} />}
          />
          <Route
            path="/dashboard/wallet"
            element={<Wallet showNotification={showNotification} />}
          />
          <Route
            path="/dashboard/vehicles"
            element={<Vehicles showNotification={showNotification} />}
          />
          <Route
            path="/dashboard/transactions"
            element={<Transactions showNotification={showNotification} />}
          />
          <Route
            path="/dashboard/reports"
            element={<Reports showNotification={showNotification} />}
          />
          <Route
            path="/dashboard/settings"
            element={<SettingsTabs showNotification={showNotification} />}
          />
        </Routes>
    </>
  );
}

export default App;
