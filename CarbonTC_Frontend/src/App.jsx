// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AOS from 'aos';

import Layout from './components/layout/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import Marketplace from './pages/Marketplace/Marketplace.jsx';

function App() {

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
      {/* NHÓM 1: CÁC TRANG PUBLIC (DÙNG LAYOUT TRANG CHỦ) */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          {/* <Route path="/about" element={<AboutPage />} /> */}
          {/* <Route path="/contact" element={<ContactPage />} /> */}
        </Route>        


        
        <Route path='/dashboard' element={<Dashboard/>}></Route>
        <Route path='/marketplace' element={<Marketplace/>}></Route>        
        {/* NHÓM 2: CÁC TRANG DASHBOARD (DÙNG LAYOUT DASHBOARD) */}
        {/* (Các comment ở đây không sao) */}
        {/* ... */}

      </Routes> {/* <--- SỬA LẠI DÒNG NÀY */}
    </BrowserRouter>
  );
}

export default App;