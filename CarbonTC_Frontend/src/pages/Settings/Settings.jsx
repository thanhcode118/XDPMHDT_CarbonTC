import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import SettingsTabs from '../../components/SettingsTabs/SettingsTabs';
import ProfileTab from '../../components/ProfileTab/ProfileTab';
import AccountTab from '../../components/AccountTab/AccountTab';
import NotificationsTab from '../../components/NotificationsTab/NotificationsTab';
import PrivacyTab from '../../components/PrivacyTab/PrivacyTab';
import ConnectedAccountsTab from '../../components/ConnectedAccountsTab/ConnectedAccountsTab';
import { useSidebar } from '../../hooks/useSidebar';
import { useNotification } from '../../hooks/useNotification';
import styles from './Settings.module.css';

const Settings = () => {
  const { sidebarActive, toggleSidebar } = useSidebar();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleSaveProfile = (profileData) => {
    console.log('Saving profile:', profileData);
    showNotification('Thông tin hồ sơ đã được cập nhật thành công!', 'success');
  };

  const handleChangePassword = (passwordData) => {
    console.log('Changing password:', passwordData);
    showNotification('Mật khẩu đã được thay đổi thành công!', 'success');
  };

  const handleSaveNotifications = (notificationSettings) => {
    console.log('Saving notifications:', notificationSettings);
    showNotification('Cài đặt thông báo đã được lưu!', 'success');
  };

  const handleSavePrivacy = (privacySettings) => {
    console.log('Saving privacy:', privacySettings);
    showNotification('Cài đặt riêng tư đã được lưu!', 'success');
  };

  const handleAccountAction = (accountId, action) => {
    console.log(`${action} account:`, accountId);
    showNotification(`Đã ${action === 'connect' ? 'kết nối' : 'ngắt kết nối'} tài khoản!`, 'success');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.')) {
      showNotification('Yêu cầu xóa tài khoản đã được gửi!', 'warning');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab onSave={handleSaveProfile} />;
      case 'account':
        return <AccountTab onChangePassword={handleChangePassword} />;
      case 'notifications':
        return <NotificationsTab onSave={handleSaveNotifications} />;
      case 'privacy':
        return <PrivacyTab onSave={handleSavePrivacy} />;
      case 'connected':
        return (
          <ConnectedAccountsTab 
            onAccountAction={handleAccountAction}
            onDeleteAccount={handleDeleteAccount}
          />
        );
      default:
        return <ProfileTab onSave={handleSaveProfile} />;
    }
  };

  if (loading) {
    return (
      <div className={styles.app}>
        <div className={styles.mainContent}>
          <div className={styles.loadingState}>
            <i className="bi bi-arrow-repeat"></i>
            <p>Đang tải cài đặt...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <button className={styles.mobileToggle} onClick={toggleSidebar}>
        <i className="bi bi-list"></i>
      </button>
      
      <Sidebar 
        activePage="settings" 
        onPageChange={() => {}} 
        className={sidebarActive ? 'activemenu' : ''}
      />
      
      <div className={styles.mainContent}>
        <Topbar 
          title="Cài đặt" 
          notificationCount={3}
          userName="Nguyễn Văn An"
        />
        
        <SettingsTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Settings;