import React from 'react';
import styles from './TripCard.module.css';

const TripCard = ({ 
  trip,
  onViewDetails 
}) => {
  const {
    id,
    date,
    status,
    startLocation,
    endLocation,
    startTime,
    endTime,
    distance,
    duration,
    credits,
    co2Reduced
  } = trip;

  return (
    <div className={styles.tripItem} onClick={onViewDetails}>
      <div className={styles.tripHeader}>
        <div className={styles.tripDate}>{date}</div>
        <div className={`${styles.tripStatus} ${styles[status]}`}>
          {status === 'completed' ? 'Đã hoàn thành' : 'Đang xử lý'}
        </div>
      </div>
      <div className={styles.tripRoute}>
        <div className={styles.tripLocation}>
          <div className={styles.tripLocationName}>{startLocation}</div>
          <div className={styles.tripLocationTime}>{startTime}</div>
        </div>
        <div className={styles.tripArrow}>
          <i className="bi bi-arrow-right-circle-fill"></i>
        </div>
        <div className={styles.tripLocation}>
          <div className={styles.tripLocationName}>{endLocation}</div>
          <div className={styles.tripLocationTime}>{endTime}</div>
        </div>
      </div>
      <div className={styles.tripDetails}>
        <div className={styles.tripDetail}>
          <div className={styles.tripDetailValue}>{distance} km</div>
          <div className={styles.tripDetailLabel}>Quãng đường</div>
        </div>
        <div className={styles.tripDetail}>
          <div className={styles.tripDetailValue}>{duration}</div>
          <div className={styles.tripDetailLabel}>Thời gian</div>
        </div>
        <div className={styles.tripDetail}>
          <div className={styles.tripDetailValue}>{credits}</div>
          <div className={styles.tripDetailLabel}>Tín chỉ</div>
        </div>
        <div className={styles.tripDetail}>
          <div className={styles.tripDetailValue}>{co2Reduced} kg</div>
          <div className={styles.tripDetailLabel}>CO₂ giảm</div>
        </div>
      </div>
    </div>
  );
};

export default TripCard;