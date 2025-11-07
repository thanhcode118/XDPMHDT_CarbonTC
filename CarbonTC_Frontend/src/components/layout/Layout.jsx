import React from 'react';
import Navbar from './Navbar/Navbar.jsx';
import Footer from './Footer/Footer.jsx';
import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet/>
      </main>
      <Footer />
    </>
  );
}

export default Layout;