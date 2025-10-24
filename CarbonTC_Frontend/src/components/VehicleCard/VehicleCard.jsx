import React from 'react';
import styles from './VehicleCard.module.css';

const VehicleCard = ({ 
  vehicle,
  onViewDetails,
  onSync,
  onConnect 
}) => {
  const {
    id,
    name,
    image,
    status,
    color,
    year,
    mileage,
    credits,
    co2Reduced,
    trips,
    isConnected
  } = vehicle;

  return (
    <div className={styles.vehicleCard} data-aos="fade-up">
      <div className={styles.vehicleImage}>
        <img src={image} alt={name} />
        <span className={`${styles.vehicleStatus} ${styles[status]}`}>
          {isConnected ? 'Đã kết nối' : 'Chưa kết nối'}
        </span>
      </div>
      <div className={styles.vehicleDetails}>
        <h3 className={styles.vehicleName}>{name}</h3>
        <div className={styles.vehicleInfo}>
          <div className={styles.vehicleInfoItem}>
            <i className="bi bi-palette"></i>
            <span>{color}</span>
          </div>
          <div className={styles.vehicleInfoItem}>
            <i className="bi bi-calendar"></i>
            <span>{year}</span>
          </div>
          <div className={styles.vehicleInfoItem}>
            <i className="bi bi-speedometer2"></i>
            <span>{mileage.toLocaleString()} km</span>
          </div>
        </div>
        <div className={styles.vehicleStats}>
          <div className={styles.vehicleStat}>
            <div className={styles.vehicleStatValue}>{credits}</div>
            <div className={styles.vehicleStatLabel}>Tín chỉ</div>
          </div>
          <div className={styles.vehicleStat}>
            <div className={styles.vehicleStatValue}>{co2Reduced} kg</div>
            <div className={styles.vehicleStatLabel}>CO₂ giảm</div>
          </div>
          <div className={styles.vehicleStat}>
            <div className={styles.vehicleStatValue}>{trips}</div>
            <div className={styles.vehicleStatLabel}>Hành trình</div>
          </div>
        </div>
        <div className={styles.vehicleActions}>
          <button 
            className={`${styles.btnCustom} ${styles.btnPrimaryCustom} ${styles.btnSm}`}
            onClick={onViewDetails}
          >
            Xem chi tiết
          </button>
          {isConnected ? (
            <button 
              className={`${styles.btnCustom} ${styles.btnOutlineCustom} ${styles.btnSm}`}
              onClick={onSync}
            >
              Đồng bộ
            </button>
          ) : (
            <button 
              className={`${styles.btnCustom} ${styles.btnPrimaryCustom} ${styles.btnSm}`}
              onClick={onConnect}
            >
              Kết nối
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;