import React from 'react';
import styles from './StatCard.module.css';

const StatCard = ({ 
  type, 
  icon, 
  value, 
  label, 
  change, 
  changeType = 'positive' // 'positive', 'negative', hoặc 'neutral'
}) => {

  const getChangeIcon = () => {
    if (changeType === 'positive') {
      return 'bi-arrow-up';
    }
    if (changeType === 'negative') {
      return 'bi-arrow-down';
    }
    return 'bi-dash'; 
  };

  return (
    <div className={`${styles.statCard} ${styles[`statCard${type}`]}`} data-aos="fade-up">
      <div className={styles.statHeader}>
        <div className={`${styles.statIcon} ${styles[`statIcon${type}`]}`}>
          <i className={`bi ${icon} text-white`}></i>
        </div>
      </div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      <div className={`${styles.statChange} ${styles[changeType]}`}>
        <i className={`bi ${getChangeIcon()}`}></i> {change}
      </div>
    </div>
  );
};

export default StatCard;