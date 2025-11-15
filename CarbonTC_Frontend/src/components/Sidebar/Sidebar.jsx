import React, { useState, useEffect } from 'react';
import styles from './Sidebar.module.css';
import { Link } from 'react-router-dom';
import authService from '../../services/authService'; // 👈 thêm dòng này
import { useAuth } from '../../hooks/useAuth'; 
import { getUserIdFromToken } from '../../services/listingService';

const Sidebar = ({ activePage, className }) => {
    const { user } = useAuth();
  // const [user, setUser] = useState(null);

  // useEffect(() => {
  //   // Lấy thông tin user từ localStorage
  //   const currentUser = authService.getCurrentUser();
  //   if (currentUser) {
  //     setUser(currentUser);
  //   }
  // }, []);

  const menuItems = [
    { icon: 'bi-speedometer2', label: 'Tổng quan', page: 'dashboard', path: '/dashboard' },
    { icon: 'bi-ev-station', label: 'Xe điện của tôi', page: 'vehicles', path: '/dashboard/vehicles' },
    { icon: 'bi-map', label: 'Hành trình', page: 'trips', path: '/dashboard/trips' },
    { icon: 'bi-wallet2', label: 'Ví carbon', page: 'wallet', path: '/dashboard/wallet' },
    { icon: 'bi-shop', label: 'Thị trường', page: 'marketplace', path: '/marketplace' }, // Path này riêng
    { icon: 'bi-arrow-left-right', label: 'Giao dịch', page: 'transactions', path: '/dashboard/transactions' },
    { icon: 'bi-graph-up', label: 'Báo cáo', page: 'reports', path: '/dashboard/reports' },
    { icon: 'bi-patch-check-fill', label: 'Xác minh', page: 'verification', path: '/dashboard/verification' },
    { icon: 'bi-gear', label: 'Cài đặt', page: 'settings', path: '/dashboard/settings' }
  ];

  // Lọc danh sách menu dựa trên vai trò của user (lấy từ useAuth)
const filteredMenuItems = menuItems.filter(item =>
  !item.roles || // Nếu item không định nghĩa roles -> hiển thị
  (user?.roleName && item.roles.includes(user.roleName)) // Nếu có, kiểm tra roleName từ context
);

  return (
    <div className={`${styles.sidebar} ${className || ''}`} id="sidebar">
      {/* Header */}
      <div className={styles.sidebarHeader}>
        <i className="bi bi-lightning-charge-fill" style={{ fontSize: '1.5rem', color: 'var(--ev-owner-color)' }}></i>
        <div className={styles.brandLogo}>CarbonCredit</div>
      </div>

      {/* Menu */}
      <ul className={styles.sidebarMenu}>
    {/* Đảm bảo đang dùng biến filteredMenuItems đã lọc */}
    {filteredMenuItems.map((item, index) => (
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

      {/* User Info */}
      <div className={styles.sidebarProfile}>
        <div className={styles.profileInfo}>
          <img 
            src={user?.avatar || `https://i.pravatar.cc/30?u=${getUserIdFromToken() || 'default'}`} 
            alt="User Avatar" 
            className={styles.profileAvatar} 
          />
          <div>
            <div className={styles.profileName}>
              {user?.fullName || 'Người dùng'}
            </div>
            <div className={styles.profileRole}>
              {user?.roleName || 'Chủ xe điện'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
