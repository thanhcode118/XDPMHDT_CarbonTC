import React from 'react';
import styles from './TripStatCard.module.css';

const TripStatCard = ({ 
  icon, 
  value, 
  label, 
  gradient = 'primary',
  delay = 0 
}) => {
  return (
    <div 
      className={styles.tripStatCard} 
      data-aos="fade-up" 
      data-aos-delay={delay}
    >
      <div className={`${styles.tripStatIcon} ${styles[`statIcon${gradient}`]}`}>
        <i className={`bi ${icon} text-white`}></i>
      </div>
      <div className={styles.tripStatValue}>{value}</div>
      <div className={styles.tripStatLabel}>{label}</div>
    </div>
  );
};

export default TripStatCard;