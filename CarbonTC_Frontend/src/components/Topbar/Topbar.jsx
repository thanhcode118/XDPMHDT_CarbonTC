import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import styles from './Topbar.module.css';

const Topbar = ({ title }) => {
 const navigate = useNavigate();
 const [showDropdown, setShowDropdown] = useState(false);
 const [user, setUser] = useState(null);
 const [isLoggingOut, setIsLoggingOut] = useState(false);
 const dropdownRef = useRef(null);

 useEffect(() => {
  // Lấy thông tin user từ localStorage
  const currentUser = authService.getCurrentUser();
  if (currentUser) {
   setUser(currentUser);
  }
 }, []);

 // Click outside to close dropdown
 useEffect(() => {
  const handleClickOutside = (event) => {
   if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
    setShowDropdown(false);
   }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
   document.removeEventListener('mousedown', handleClickOutside);
  };
 }, []);

 const handleLogout = async () => {
  // Xác nhận logout
  const confirmLogout = window.confirm('Bạn có chắc chắn muốn đăng xuất?');
  if (!confirmLogout) return;

  setIsLoggingOut(true);
  
  try {
   // Gọi API logout
   await authService.logout();
   
   // Show success message (optional)
   alert('Đăng xuất thành công!');
   
   // Redirect to login page
   navigate('/login');
  } catch (error) {
   console.error('Logout failed:', error);
   // Dù lỗi vẫn redirect về login vì authService đã clear tokens
   navigate('/login');
  } finally {
   setIsLoggingOut(false);
  }
 };

 const toggleDropdown = () => {
  setShowDropdown(!showDropdown);
 };

 return (
  <div className={styles.topbar}>
   <h1 className={styles.topbarTitle}>{title}</h1>
   <div className={styles.topbarActions}>
    {/* Notification Button */}
    <div className={styles.notificationBtn}>
     <i className="bi bi-bell"></i>
     <span className={styles.notificationBadge}>3</span>
    </div>
    
    {/* User Profile with Dropdown */}
    <div className={styles.profileContainer} ref={dropdownRef}>
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
       src={user?.avatar || "https://picsum.photos/seed/user123/35/35.jpg"} 
       alt="User Avatar" 
       className={styles.userAvatar} 
      />
      <span className={styles.userName}>
       {user?.fullName || 'Người dùng'}
      </span>
      <i className={`bi bi-chevron-down ${styles.dropdownIcon} ${showDropdown ? styles.dropdownIconActive : ''}`}></i>
     </div>

     {/* Dropdown Menu */}
     {showDropdown && (
      <div className={styles.dropdownMenu}>
       <div className={styles.dropdownHeader}>
        <div className={styles.userInfo}>
         <img 
          src={user?.avatar || "https://picsum.photos/seed/user123/50/50.jpg"} 
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
        {/* Đã xóa nút Profile và Settings */}
        
        {/* Đã xóa vạch chia ở giữa */}
        
        <button 
         className={`${styles.dropdownItem} ${styles.logoutItem}`}
         onClick={handleLogout}
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
      </div>
     )}
    </div>
 	  </div>
 	</div>
 );
};

export default Topbar;