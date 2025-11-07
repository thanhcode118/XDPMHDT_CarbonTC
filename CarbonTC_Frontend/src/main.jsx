// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import AppRouter from '../src/admin/routes/AppRoutes.tsx';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'aos/dist/aos.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* ✅ Admin routes - NO AuthProvider */}
          <Route path="/admin/*" element={<AppRouter />} />

          {/* ✅ User routes - WITH AuthProvider */}
          <Route
            path="/*"
            element={
              <AuthProvider>
                <App />
              </AuthProvider>
            }
          />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  </StrictMode>
);
