import React, { useState, useEffect } from 'react';
import TripMap from '../TripMap/TripMap';
import { getJourneyById } from '../../services/tripService';
import styles from './TripDetailModal.module.css';

const TripDetailModal = ({ 
  show, 
  onClose, 
  trip,
  journeyId,
  onExportReport 
}) => {
  const [journeyData, setJourneyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show && journeyId) {
      loadJourneyDetails();
    } else if (show && trip) {
      // If trip data is passed directly, use it
      setJourneyData(trip);
    }
  }, [show, journeyId, trip]);

  const loadJourneyDetails = async () => {
    if (!journeyId) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await getJourneyById(journeyId);
      if (result.success && result.data) {
        setJourneyData(result.data);
      } else {
        setError(result.message || 'Không thể tải chi tiết hành trình');
      }
    } catch (err) {
      console.error('Error loading journey details:', err);
      setError(err.response?.data?.message || err.message || 'Không thể tải chi tiết hành trình');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  // If we have journeyId but no data yet, show loading
  if (journeyId && !journeyData && loading) {
    return (
      <div className={`${styles.modal} ${show ? styles.show : ''}`}>
        <div className={styles.modalOverlay} onClick={onClose}></div>
        <div className={styles.modalContent}>
          <div className={styles.modalBody} style={{ textAlign: 'center', padding: '40px' }}>
            <i className="bi bi-arrow-repeat" style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }}></i>
            <p style={{ marginTop: '20px' }}>Đang tải chi tiết hành trình...</p>
          </div>
        </div>
      </div>
    );
  }

  // If error occurred
  if (error) {
    return (
      <div className={`${styles.modal} ${show ? styles.show : ''}`}>
        <div className={styles.modalOverlay} onClick={onClose}></div>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h5 className={styles.modalTitle}>Lỗi</h5>
            <button type="button" className={styles.btnClose} onClick={onClose}>
              <i className="bi bi-x"></i>
            </button>
          </div>
          <div className={styles.modalBody} style={{ textAlign: 'center', padding: '40px' }}>
            <i className="bi bi-exclamation-triangle" style={{ fontSize: '2rem', color: '#ef4444' }}></i>
            <p style={{ marginTop: '20px', color: '#ef4444' }}>{error}</p>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.btnCloseModal} onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If no data available
  if (!journeyData && !trip) return null;

  // Use journeyData if available, otherwise fall back to trip prop
  const data = journeyData || trip;
  
  // Format dates
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString('vi-VN');
  };

  const formatTime = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate duration
  const calculateDuration = () => {
    if (!data.startTime || !data.endTime) return 'N/A';
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'N/A';
    
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    if (hours > 0) {
      return `${hours} giờ ${mins} phút`;
    }
    return `${mins} phút`;
  };

  // Extract data with fallbacks
  const startTimeObj = data.startTime ? new Date(data.startTime) : null;
  const endTimeObj = data.endTime ? new Date(data.endTime) : null;
  const date = startTimeObj ? formatDate(startTimeObj).split(',')[0] : 'N/A';
  const startLocation = data.origin || data.startLocation || 'N/A';
  const endLocation = data.destination || data.endLocation || 'N/A';
  const startTime = formatTime(data.startTime);
  const endTime = formatTime(data.endTime);
  const distance = data.distanceKm || data.distance || 0;
  const credits = data.calculatedCarbonCredits || data.credits || 0;
  const co2Reduced = data.calculatedCarbonCredits || data.co2Reduced || 0;
  const vehicle = data.vehicleType || data.vehicleModel || data.vehicle || 'N/A';
  const duration = calculateDuration();
  
  // Calculate average speed (km/h) if we have distance and duration
  const averageSpeed = (() => {
    if (!startTimeObj || !endTimeObj || !distance) return 'N/A';
    const diffHours = (endTimeObj - startTimeObj) / (1000 * 60 * 60);
    if (diffHours <= 0) return 'N/A';
    return `${(distance / diffHours).toFixed(1)} km/h`;
  })();

  const tripStats = [
    {
      icon: 'bi-signpost-2-fill',
      value: `${distance.toFixed(2)} km`,
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
      value: credits.toFixed(2),
      label: 'Tín chỉ',
      gradient: '3'
    },
    {
      icon: 'bi-cloud-arrow-down-fill',
      value: `${co2Reduced.toFixed(2)} kg`,
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
                  <td>Trạng thái</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      background: data.status?.toLowerCase() === 'pending' 
                        ? 'rgba(251, 191, 36, 0.2)' 
                        : data.status?.toLowerCase() === 'completed' || data.status?.toLowerCase() === 'verified'
                        ? 'rgba(74, 222, 128, 0.2)'
                        : 'rgba(107, 114, 128, 0.2)',
                      color: data.status?.toLowerCase() === 'pending' 
                        ? '#fbbf24' 
                        : data.status?.toLowerCase() === 'completed' || data.status?.toLowerCase() === 'verified'
                        ? '#4ade80'
                        : '#6b7280'
                    }}>
                      {data.status || 'N/A'}
                    </span>
                  </td>
                </tr>
                {data.id && (
                  <tr>
                    <td>ID Hành trình</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {data.id.substring(0, 8)}...
                    </td>
                  </tr>
                )}
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