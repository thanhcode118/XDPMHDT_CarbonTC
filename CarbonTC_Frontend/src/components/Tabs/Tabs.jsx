import React from 'react';
import styles from './Tabs.module.css';

const Tabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'buy', label: 'Mua tín chỉ' },
    { id: 'sell', label: 'Bán tín chỉ' },
    { id: 'auction', label: 'Đấu giá' }
  ];

  return (
    <div className={styles.customTabs} data-aos="fade-up" data-aos-delay="100">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`${styles.customTab} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
};

export default Tabs;