import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import styles from './Topbar.module.css';
import AlertBox from '../../components/AlertBox/AlertBox'; 
import CustomModal from '../../components/CustomModal/CustomModal'; 
import { getUserIdFromToken } from '../../services/listingService';

const Topbar = ({ title }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [message, setMessage] = useState(null); 
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  // Tính toán vị trí dropdown
  const calculateDropdownPosition = () => {
    if (profileRef.current) {
      const rect = profileRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX - 280 // trừ chiều rộng dropdown
      });
    }
  };

  const toggleDropdown = () => {
    if (!showDropdown) {
      calculateDropdownPosition();
    }
    setShowDropdown(!showDropdown);
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          profileRef.current && !profileRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // HÀM CHỈ CÓ NHIỆM VỤ HIỂN THỊ MODAL XÁC NHẬN
  const handleLogout = () => {
    setShowDropdown(false); // Đóng dropdown trước khi mở modal
    setShowLogoutModal(true);
  };
  
  // HÀM XỬ LÝ LOGIC ĐĂNG XUẤT SAU KHI XÁC NHẬN
  const confirmLogout = async () => {
    setShowLogoutModal(false); // Ẩn modal
    setIsLoggingOut(true);
    setMessage(null); // Xóa thông báo cũ

    try {
      // Gọi API logout
      await authService.logout();
      localStorage.clear();
      // THAY THẾ alert() bằng AlertBox (Thông báo thành công)
      setMessage({
          type: 'success',
          text: 'Đăng xuất thành công! Đang chuyển hướng...'
      });
      
      // Chờ một chút để người dùng đọc thông báo
      setTimeout(() => {
        navigate('/login');
      }, 1000); // Chuyển hướng sau 1 giây
      
    } catch (error) {
      console.error('Logout failed:', error);
      
      // THAY THẾ console.error bằng AlertBox (Thông báo lỗi)
      setMessage({
        type: 'error',
        text: error.message || 'Đăng xuất thất bại, nhưng hệ thống vẫn sẽ chuyển hướng.'
      });
      
      // Dù lỗi vẫn redirect về login vì authService đã clear tokens
      setTimeout(() => {
        navigate('/login');
      }, 3000); 
    } finally {
      // Tắt loading sau khi hoàn tất (hoặc đã chuyển hướng)
      setIsLoggingOut(false);
    }
  };

  // Dropdown Component được render qua Portal
  const DropdownMenu = () => {
    if (!showDropdown) return null;

    return ReactDOM.createPortal(
      <div 
        className={styles.dropdownMenu}
        ref={dropdownRef}
        style={{
          position: 'fixed',
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          zIndex: 9999
        }}
      >
        <div className={styles.dropdownHeader}>
          <div className={styles.userInfo}>
            <img 
              src={user?.avatar || `https://i.pravatar.cc/30?u=${getUserIdFromToken() || 'default'}`} 
              alt="User Avatar" 
              className={styles.dropdownAvatar} 
            />
            <div className={styles.userDetails}>
              <p className={styles.userFullName}>{user?.fullName || 'Người dùng'}</p>
              <p className={styles.userEmail}>{user?.email || 'email@example.com'}</p>
              <span className={styles.userRole}>{user?.roleName || 'User'}</span>
            </div>
          </div>
        </div>
        
        <div className={styles.dropdownDivider}></div>
        
        <div className={styles.dropdownBody}>
          <button 
            className={`${styles.dropdownItem} ${styles.logoutItem}`}
            onClick={handleLogout} // Gọi hàm hiển thị modal
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <i className="bi bi-hourglass-split"></i>
                <span>Đang đăng xuất...</span>
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-right"></i>
                <span>Đăng xuất</span>
              </>
            )}
          </button>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      {message && <AlertBox message={message} />} 

      <div className={styles.topbar}>
        <h1 className={styles.topbarTitle}>{title}</h1>
        <div className={styles.topbarActions}>
          {/* Notification Button */}
          <div className={styles.notificationBtn}>
            <i className="bi bi-bell"></i>
            <span className={styles.notificationBadge}>3</span>
          </div>
          
          {/* User Profile with Dropdown */}
          <div className={styles.profileContainer} ref={profileRef}>
            <div 
              className={styles.userProfile} 
              onClick={toggleDropdown}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  toggleDropdown();
                }
              }}
            >
              <img 
                src={user?.avatar || `https://i.pravatar.cc/30?u=${getUserIdFromToken() || 'default'}`} 
                alt="User Avatar" 
                className={styles.userAvatar} 
              />
              <span className={styles.userName}>
                {user?.fullName || 'Người dùng'}
              </span>
              <i className={`bi bi-chevron-down ${styles.dropdownIcon} ${showDropdown ? styles.dropdownIconActive : ''}`}></i>
            </div>
          </div>
        </div>
      </div>
      <DropdownMenu />
      
      {/* RENDER CUSTOM MODAL XÁC NHẬN LOGOUT */}
      <CustomModal 
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout} 
        title="Xác nhận Đăng xuất"
        body="Bạn có chắc chắn muốn thoát khỏi phiên làm việc hiện tại?"
        confirmText="Đăng xuất"
        danger={false} // Đây không phải hành động "Danger" (xóa), nên dùng màu Primary
      />
    </>
  );
};

export default Topbar;