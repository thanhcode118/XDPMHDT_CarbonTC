import React, { useState } from 'react';
import styles from './NotificationsTab.module.css';

const NotificationsTab = ({ onSave }) => {
  const [notifications, setNotifications] = useState({
    transactionNotifications: true,
    tripNotifications: true,
    marketNotifications: false,
    reportNotifications: true,
    emailNotifications: true
  });

  const handleToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    onSave(notifications);
  };

  const notificationItems = [
    {
      id: 'transactionNotifications',
      title: 'Thông báo giao dịch',
      description: 'Nhận thông báo khi có giao dịch mới'
    },
    {
      id: 'tripNotifications',
      title: 'Thông báo hành trình',
      description: 'Nhận thông báo khi có hành trình mới được đồng bộ'
    },
    {
      id: 'marketNotifications',
      title: 'Thông báo thị trường',
      description: 'Nhận thông báo về giá tín chỉ carbon'
    },
    {
      id: 'reportNotifications',
      title: 'Báo cáo hàng tháng',
      description: 'Nhận báo cáo tổng hợp hàng tháng'
    },
    {
      id: 'emailNotifications',
      title: 'Email thông báo',
      description: 'Nhận thông báo qua email'
    }
  ];

  return (
    <div className={styles.tabContent} data-aos="fade-up">
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <h4 className={styles.cardTitle}>Cài đặt thông báo</h4>
          
          {notificationItems.map((item, index) => (
            <div key={item.id} className={styles.notificationItem}>
              <div className={styles.notificationInfo}>
                <div className={styles.notificationTitle}>{item.title}</div>
                <div className={styles.notificationDescription}>{item.description}</div>
              </div>
              <div className={styles.formSwitch}>
                <input 
                  className={styles.formCheckInput}
                  type="checkbox" 
                  id={item.id}
                  checked={notifications[item.id]}
                  onChange={() => handleToggle(item.id)}
                />
                <label className={styles.formCheckLabel} htmlFor={item.id}></label>
              </div>
            </div>
          ))}
          
          <button 
            className={`${styles.btnCustom} ${styles.btnPrimaryCustom} ${styles.saveButton}`}
            onClick={handleSave}
          >
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsTab;