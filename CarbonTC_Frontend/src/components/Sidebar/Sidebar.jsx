import React from 'react';
import styles from './Sidebar.module.css';
import { Link } from 'react-router-dom';

const Sidebar = ({ activePage, className }) => {
  const menuItems = [
    { icon: 'bi-speedometer2', label: 'Tổng quan', page: 'dashboard', path: '/dashboard' },
    { icon: 'bi-ev-station', label: 'Xe điện của tôi', page: 'vehicles', path: '/dashboard/vehicles' },
    { icon: 'bi-map', label: 'Hành trình', page: 'trips', path: '/dashboard/trips' },
    { icon: 'bi-wallet2', label: 'Ví carbon', page: 'wallet', path: '/dashboard/wallet' },
    { icon: 'bi-shop', label: 'Thị trường', page: 'marketplace', path: '/marketplace' }, // Path này riêng
    { icon: 'bi-arrow-left-right', label: 'Giao dịch', page: 'transactions', path: '/dashboard/transactions' },
    { icon: 'bi-graph-up', label: 'Báo cáo', page: 'reports', path: '/dashboard/reports' },
    { icon: 'bi-gear', label: 'Cài đặt', page: 'settings', path: '/dashboard/settings' }
  ];

  return (
    <div className={`${styles.sidebar} ${className || ''}`} id="sidebar">
      <div className={styles.sidebarHeader}>
        <i className="bi bi-lightning-charge-fill" style={{ fontSize: '1.5rem', color: 'var(--ev-owner-color)' }}></i>
        <div className={styles.brandLogo}>CarbonCredit</div>
      </div>
      <ul className={styles.sidebarMenu}>
        {menuItems.map((item, index) => (
          <li key={index}>
            <Link 
              to={item.path} 
              className={activePage === item.page ? styles.active : ''}
              
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className={styles.sidebarProfile}>
        <div className={styles.profileInfo}>
          <img src="https://picsum.photos/seed/user123/40/40.jpg" alt="User Avatar" className={styles.profileAvatar} />
          <div>
            <div className={styles.profileName}>Nguyễn Văn An</div>
            <div className={styles.profileRole}>Chủ xe điện</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;