// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AOS from 'aos';

import Layout from './components/layout/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import Marketplace from './pages/Marketplace/Marketplace.jsx';
import Vehicles from './pages/Vehicles/Vehicles.jsx';
import { useNotification } from './hooks/useNotification'; // Hook của bạn
import Trips from './pages/Trips/Trips.jsx';

function App() {
  // 1. Lấy cả 2 thứ từ hook
  const { NotificationComponent, showNotification } = useNotification();  
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []); 
  return (
    <BrowserRouter>
      {/* 2. Đặt Component thông báo ở đây để nó hiển thị toàn cục */}
      <NotificationComponent />       
      <Routes>
      {/* NHÓM 1: CÁC TRANG PUBLIC (DÙNG LAYOUT TRANG CHỦ) */}
        {/* Trang Home của bạn VẪN CÒN ĐÂY, không mất đi đâu cả */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} /> 
            {/* Bạn có thể truyền 'showNotification' vào đây nếu HomePage cần */}
            {/* <Route path="/" element={<HomePage showNotification={showNotification} />} /> */}
        </Route>    

        {/* 3. Truyền hàm 'showNotification' vào các trang cần nó */}
        <Route 
          path='/dashboard' 
          element={<Dashboard showNotification={showNotification} />} 
        />
        <Route 
          path='/marketplace' 
          element={<Marketplace showNotification={showNotification} />} 
        /> 
        <Route 
          path='/dashboard/trips' 
          element={<Trips showNotification={showNotification} />} 
        /> 
        <Route 
          path='/dashboard/vehicles' 
          element={<Vehicles showNotification={showNotification} />} 
      /> 

      </Routes>
    </BrowserRouter>
  );
}

export default App;