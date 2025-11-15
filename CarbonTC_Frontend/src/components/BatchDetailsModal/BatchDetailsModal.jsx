import React from 'react';
import styles from './BatchDetailsModal.module.css';

const BatchDetailsModal = ({ show, onClose, batch }) => {
  if (!show || !batch) return null;

  // Hàm format ngày thành dd/mm/yy
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2); // Lấy 2 số cuối của năm
    
    return `${day}/${month}/${year}`;
  };

  const getStatusDisplay = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'pending':
        return { text: 'Chờ Gửi', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.2)' };
      case 'submittedforverification':
      case 'submitted':
        return { text: 'Đã Gửi Xác Minh', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)' };
      case 'verified':
        return { text: 'Đã Xác Minh', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.2)' };
      case 'rejected':
        return { text: 'Đã Từ Chối', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)' };
      case 'creditsissued':
        return { text: 'Đã Phát Hành Tín Chỉ', color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' };
      default:
        return { text: status || 'Không xác định', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.2)' };
    }
  };

  const statusInfo = getStatusDisplay(batch.status);
  const journeys = batch.journeys || [];

  return (
    <div className={`${styles.modal} ${show ? styles.show : ''}`}>
      <div className={styles.modalOverlay} onClick={onClose}></div>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h5 className={styles.modalTitle}>Chi Tiết Lô Hành Trình</h5>
          <button type="button" className={styles.btnClose} onClick={onClose}>
            <i className="bi bi-x"></i>
          </button>
        </div>
        <div className={styles.modalBody}>
          {/* Batch Info */}
          <div className={styles.infoSection}>
            <h6 className={styles.sectionTitle}>Thông Tin Lô</h6>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>ID Lô:</span>
                <span className={styles.infoValue}>#{batch.id?.substring(0, 8) || 'N/A'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Trạng Thái:</span>
                <span 
                  className={styles.statusBadge}
                  style={{
                    background: statusInfo.bg,
                    color: statusInfo.color
                  }}
                >
                  {statusInfo.text}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Tín chỉ Carbon:</span>
                <span className={styles.infoValue}>
                  {batch.totalCO2Reduced ? batch.totalCO2Reduced.toFixed(2) : '0.00'} kg
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Số Hành Trình:</span>
                <span className={styles.infoValue}>{journeys.length}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Ngày Tạo:</span>
                <span className={styles.infoValue}>
                  {formatDate(batch._createdDateObj || batch.creationTime)}
                </span>
              </div>
              {(batch._submittedDateObj || batch.submittedDateFormatted) && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Ngày Gửi:</span>
                  <span className={styles.infoValue}>
                    {formatDate(batch._submittedDateObj)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Journeys List */}
          <div className={styles.journeysSection}>
            <h6 className={styles.sectionTitle}>Danh Sách Hành Trình ({journeys.length})</h6>
            {journeys.length > 0 ? (
              <div className={styles.journeysList}>
                {journeys.map((journey, index) => {
                  const startTime = journey.startTime ? new Date(journey.startTime) : null;
                  const endTime = journey.endTime ? new Date(journey.endTime) : null;
                  
                  return (
                    <div key={journey.id || index} className={styles.journeyItem}>
                      <div className={styles.journeyHeader}>
                        <span className={styles.journeyNumber}>#{index + 1}</span>
                        <span className={styles.journeyDate}>
                          {formatDate(journey.startTime)}
                        </span>
                      </div>
                      <div className={styles.journeyDetails}>
                        <div className={styles.journeyDetailRow}>
                          <i className="bi bi-geo-alt-fill"></i>
                          <span>{journey.origin || 'N/A'}</span>
                          <i className="bi bi-arrow-right"></i>
                          <span>{journey.destination || 'N/A'}</span>
                        </div>
                        <div className={styles.journeyDetailRow}>
                          <i className="bi bi-speedometer2"></i>
                          <span>{journey.distanceKm || 0} km</span>
                          <i className="bi bi-award"></i>
                          <span>{journey.calculatedCarbonCredits?.toFixed(2) || '0.00'} kg CO₂</span>
                        </div>
                        {startTime && endTime && (
                          <div className={styles.journeyDetailRow}>
                            <i className="bi bi-clock"></i>
                            <span>
                              {startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - 
                              {endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}
                        {journey.vehicleType && (
                          <div className={styles.journeyDetailRow}>
                            <i className="bi bi-car-front"></i>
                            <span>{journey.vehicleType}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyJourneys}>
                <i className="bi bi-inbox"></i>
                <p>Lô này chưa có hành trình nào</p>
              </div>
            )}
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnCloseModal} onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchDetailsModal;

