import React, { useState } from 'react';
import styles from './PrivacyTab.module.css';

const PrivacyTab = ({ onSave }) => {
  const [privacySettings, setPrivacySettings] = useState({
    showName: true,
    showEmail: false,
    showPhone: false,
    showBio: true,
    shareData: true,
    shareStats: false
  });

  const handleToggle = (key) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    onSave(privacySettings);
  };

  const profileSettings = [
    { id: 'showName', label: 'Hiển thị tên' },
    { id: 'showEmail', label: 'Hiển thị email' },
    { id: 'showPhone', label: 'Hiển thị số điện thoại' },
    { id: 'showBio', label: 'Hiển thị giới thiệu' }
  ];

  const dataSettings = [
    { 
      id: 'shareData', 
      label: 'Chia sẻ dữ liệu ẩn danh để cải thiện sản phẩm' 
    },
    { 
      id: 'shareStats', 
      label: 'Cho phép hiển thị thống kê công khai' 
    }
  ];

  return (
    <div className={styles.tabContent} data-aos="fade-up">
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <h4 className={styles.cardTitle}>Cài đặt riêng tư</h4>
          
          <div className={styles.settingsSection}>
            <h5 className={styles.sectionTitle}>Hiển thị hồ sơ công khai</h5>
            <p className={styles.sectionDescription}>
              Kiểm soát những thông tin nào hiển thị công khai trên hồ sơ của bạn
            </p>
            
            {profileSettings.map(setting => (
              <div key={setting.id} className={styles.checkboxItem}>
                <input 
                  className={styles.formCheckInput}
                  type="checkbox" 
                  id={setting.id}
                  checked={privacySettings[setting.id]}
                  onChange={() => handleToggle(setting.id)}
                />
                <label className={styles.formCheckLabel} htmlFor={setting.id}>
                  {setting.label}
                </label>
              </div>
            ))}
          </div>
          
          <div className={styles.settingsSection}>
            <h5 className={styles.sectionTitle}>Chia sẻ dữ liệu</h5>
            <p className={styles.sectionDescription}>
              Chia sẻ dữ liệu của bạn để cải thiện dịch vụ
            </p>
            
            {dataSettings.map(setting => (
              <div key={setting.id} className={styles.checkboxItem}>
                <input 
                  className={styles.formCheckInput}
                  type="checkbox" 
                  id={setting.id}
                  checked={privacySettings[setting.id]}
                  onChange={() => handleToggle(setting.id)}
                />
                <label className={styles.formCheckLabel} htmlFor={setting.id}>
                  {setting.label}
                </label>
              </div>
            ))}
          </div>
          
          <button 
            className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
            onClick={handleSave}
          >
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyTab;