import React, { useState, useEffect } from 'react';
import styles from './Sidebar.module.css';
import { Link } from 'react-router-dom';
// import authService from '../../services/authService'; 
import { useAuth } from '../../hooks/useAuth';
import { getUserIdFromToken } from '../../services/listingService';

const Sidebar = ({ activePage, className }) => {
    const { user: authUser } = useAuth(); // Lấy user từ hook nếu có
    const [currentRole, setCurrentRole] = useState(null);

    // --- XỬ LÝ LẤY ROLE TỪ TOKEN ---
    useEffect(() => {
        // 1. Lấy token từ localStorage (key thường là 'accessToken' hoặc 'token')
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

        if (token) {
            try {
                // 2. Decode token (phần payload ở giữa)
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                
                const decodedToken = JSON.parse(jsonPayload);

                // 3. Lấy role dựa trên key chuẩn của Microsoft Identity
                const roleKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
                const role = decodedToken[roleKey]; // Giá trị sẽ là "CVA"

                setCurrentRole(role);
            } catch (error) {
                console.error("Lỗi decode token:", error);
            }
        } else if (authUser?.roleName) {
            // Fallback: Nếu không tự decode được thì dùng từ useAuth
            setCurrentRole(authUser.roleName);
        }
    }, [authUser]);

    // --- CẤU HÌNH MENU VỚI PHÂN QUYỀN ---
    // Giả sử role của người dùng bình thường là 'EVOwner' (hoặc null/undefined)
    // Role của nhân viên xác minh là 'CVA'
    
    const menuItems = [
        // Các mục chỉ dành cho EVOwner (Chủ xe)
        { icon: 'bi-speedometer2', label: 'Tổng quan', page: 'dashboard', path: '/dashboard', roles: ['EVOwner'] },
        { icon: 'bi-ev-station', label: 'Xe điện của tôi', page: 'vehicles', path: '/dashboard/vehicles', roles: ['EVOwner'] },
        { icon: 'bi-map', label: 'Hành trình', page: 'trips', path: '/dashboard/trips', roles: ['EVOwner'] },
        { icon: 'bi-wallet2', label: 'Ví carbon', page: 'wallet', path: '/dashboard/wallet', roles: ['EVOwner'] },
        { icon: 'bi-shop', label: 'Thị trường', page: 'marketplace', path: '/marketplace', roles: ['EVOwner'] },
        { icon: 'bi-arrow-left-right', label: 'Giao dịch', page: 'transactions', path: '/dashboard/transactions', roles: ['EVOwner'] },
        { icon: 'bi-graph-up', label: 'Báo cáo', page: 'reports', path: '/dashboard/reports', roles: ['EVOwner'] },
        
        // Mục dành riêng cho CVA (Verifier)
        { icon: 'bi-patch-check-fill', label: 'Xác minh', page: 'verification', path: '/dashboard/verification', roles: ['CVA'] },
        
        // Mục chung cho cả hai
        { icon: 'bi-gear', label: 'Cài đặt', page: 'settings', path: '/dashboard/settings', roles: ['EVOwner', 'CVA'] }
    ];

    // --- LOGIC LỌC MENU ---
    const filteredMenuItems = menuItems.filter(item => {
        // Nếu chưa lấy được role (mới login), mặc định hiển thị menu của EVOwner hoặc ẩn hết tuỳ logic
        // Ở đây logic là:
        
        // 1. Nếu user là CVA -> Chỉ hiện item có chứa 'CVA'
        if (currentRole === 'CVA') {
            return item.roles && item.roles.includes('CVA');
        }

        // 2. Nếu user KHÔNG phải CVA (là EVOwner hoặc user thường)
        // -> Hiện các item dành cho EVOwner HOẶC item không quy định roles
        return !item.roles || item.roles.includes('EVOwner');
    });

    return (
        <div className={`${styles.sidebar} ${className || ''}`} id="sidebar">
            {/* Header */}
            <div className={styles.sidebarHeader}>
                <i className="bi bi-lightning-charge-fill" style={{ fontSize: '1.5rem', color: 'var(--ev-owner-color)' }}></i>
                <div className={styles.brandLogo}>CarbonCredit</div>
            </div>

            {/* Menu */}
            <ul className={styles.sidebarMenu}>
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
                        src={authUser?.avatar || `https://i.pravatar.cc/30?u=${getUserIdFromToken() || 'default'}`}
                        alt="User Avatar"
                        className={styles.profileAvatar}
                    />
                    <div>
                        <div className={styles.profileName}>
                            {authUser?.fullName || 'Người dùng'}
                        </div>
                        <div className={styles.profileRole}>
                            {/* Hiển thị tên role đẹp hơn */}
                            {currentRole === 'CVA' ? 'Đơn vị xác minh' : (authUser?.roleName || 'Chủ xe điện')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;