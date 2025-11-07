import React from 'react';
import TripMap from '../TripMap/TripMap';
import styles from './TripDetailModal.module.css';

const TripDetailModal = ({ 
  show, 
  onClose, 
  trip,
  onExportReport 
}) => {
  if (!show || !trip) return null;

  const {
    date,
    startLocation,
    endLocation,
    startTime,
    endTime,
    distance,
    duration,
    credits,
    co2Reduced,
    vehicle,
    averageSpeed,
    energyConsumption
  } = trip;

  const tripStats = [
    {
      icon: 'bi-signpost-2-fill',
      value: `${distance} km`,
      label: 'Quãng đường',
      gradient: '1'
    },
    {
      icon: 'bi-clock-fill',
      value: duration,
      label: 'Thời gian',
      gradient: '2'
    },
    {
      icon: 'bi-lightning-charge-fill',
      value: credits.toString(),
      label: 'Tín chỉ',
      gradient: '3'
    },
    {
      icon: 'bi-cloud-arrow-down-fill',
      value: `${co2Reduced} kg`,
      label: 'CO₂ giảm',
      gradient: '4'
    }
  ];

  return (
    <div className={`${styles.modal} ${show ? styles.show : ''}`}>
      <div className={styles.modalOverlay} onClick={onClose}></div>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h5 className={styles.modalTitle}>Chi tiết hành trình</h5>
          <button 
            type="button" 
            className={styles.btnClose}
            onClick={onClose}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.tripDetailStats}>
            {tripStats.map((stat, index) => (
              <div key={index} className={styles.tripDetailStat}>
                <div className={`${styles.tripDetailStatIcon} ${styles[`detailStatIcon${stat.gradient}`]}`}>
                  <i className={`bi ${stat.icon} text-white`}></i>
                </div>
                <div className={styles.tripDetailStatInfo}>
                  <div className={styles.tripDetailStatValue}>{stat.value}</div>
                  <div className={styles.tripDetailStatLabel}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
          
          <TripMap 
            startLocation={{ name: startLocation, lat: 21.0285, lng: 105.8542 }}
            endLocation={{ name: endLocation, lat: 20.8449, lng: 106.6881 }}
            height="300px"
          />
          
          <div className={styles.tripInfo}>
            <h6>Thông tin chi tiết</h6>
            <table className={styles.infoTable}>
              <tbody>
                <tr>
                  <td>Ngày</td>
                  <td>{date}</td>
                </tr>
                <tr>
                  <td>Xe điện</td>
                  <td>{vehicle}</td>
                </tr>
                <tr>
                  <td>Điểm bắt đầu</td>
                  <td>{startLocation}</td>
                </tr>
                <tr>
                  <td>Điểm kết thúc</td>
                  <td>{endLocation}</td>
                </tr>
                <tr>
                  <td>Thời gian bắt đầu</td>
                  <td>{startTime}</td>
                </tr>
                <tr>
                  <td>Thời gian kết thúc</td>
                  <td>{endTime}</td>
                </tr>
                <tr>
                  <td>Tốc độ trung bình</td>
                  <td>{averageSpeed}</td>
                </tr>
                <tr>
                  <td>Năng lượng tiêu thụ</td>
                  <td>{energyConsumption}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button 
            type="button" 
            className={`${styles.btnCustom} ${styles.btnOutlineCustom}`}
            onClick={onClose}
          >
            Đóng
          </button>
          <button 
            type="button" 
            className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
            onClick={onExportReport}
          >
            Xuất báo cáo
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripDetailModal;