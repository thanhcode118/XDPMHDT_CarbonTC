import React from 'react';
import styles from './SettingsTabs.module.css';

const SettingsTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'profile', label: 'Hồ sơ' },
    { id: 'account', label: 'Tài khoản' },
    { id: 'notifications', label: 'Thông báo' },
    { id: 'privacy', label: 'Riêng tư' },
    { id: 'connected', label: 'Tài khoản liên kết' }
  ];

  return (
    <div className={styles.settingsTabs}>
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`${styles.settingsTab} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
};

export default SettingsTabs;