import React from 'react';
import styles from './TripsTabs.module.css'; // Sử dụng CSS Module mới

const TripsTabs = ({ activeTab, onTabChange }) => {
  // Định nghĩa các tab cụ thể cho trang Trips
  const tabs = [
     { id: 'batches', label: 'Lô hành trình' },      // Tab quản lý Lô
    { id: 'history', label: 'Lịch sử hành trình' } // Tab xem TripCard
  ];

  return (
    // Thêm class 'tripsTabsContainer' để phân biệt (CLS)
    <div className={`${styles.tripsTabs} ${styles.tripsTabsContainer}`} data-aos="fade-up">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`${styles.tripsTab} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
};

export default TripsTabs;