import React from 'react';
import styles from './StatCard.module.css';

const StatCard = ({ 
  type, 
  icon, 
  value, 
  label, 
  change, 
  changeType = 'positive' 
}) => {
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
        <i className="bi bi-arrow-up"></i> {change}
      </div>
    </div>
  );
};

export default StatCard;