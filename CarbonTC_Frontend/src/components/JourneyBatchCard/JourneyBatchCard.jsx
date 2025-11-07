import React from 'react';
import styles from './JourneyBatchCard.module.css'; // File CSS mới
import Button from '../Button/Button'; // Sử dụng Button chung

// Hàm helper để lấy style badge dựa trên status
const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case 'đã xử lý':
      return styles.completed;
    case 'đang xử lý':
      return styles.pending;
    case 'lỗi':
      return styles.error; // Thêm style 'error' vào CSS
    default:
      return styles.defaultStatus; // Style mặc định
  }
};

const JourneyBatchCard = ({ batch, onViewDetails, onDelete }) => {
  const { id, uploadDate, tripCount, status } = batch;

  return (
    <div className={styles.batchCard} data-aos="fade-up"> {/* Sử dụng class mới */}
      <div className={styles.batchHeader}>
        <div className={styles.batchId}>Lô: #{id}</div>
        <div className={`${styles.batchStatus} ${getStatusStyle(status)}`}>
          {status || 'Không xác định'}
        </div>
      </div>

      <div className={styles.batchDetails}>
        <div className={styles.batchDetailItem}>
          <i className="bi bi-calendar-check"></i>
          <span>Ngày tải lên: {uploadDate}</span>
        </div>
        <div className={styles.batchDetailItem}>
          <i className="bi bi-list-ol"></i>
          <span>Số chuyến đi: {tripCount}</span>
        </div>
      </div>

      <div className={styles.batchActions}>
        <Button
          variant="outline"
          size="small"
          onClick={() => onViewDetails(id)}
         >
          <i className="bi bi-eye me-1"></i>Chi tiết
        </Button>
        <Button
          variant="outline"
          size="small"
          onClick={() => onDelete(id)}
          className={styles.deleteButton} // Thêm class riêng cho nút xóa
         >
           <i className="bi bi-trash me-1"></i>Xóa
        </Button>
      </div>
    </div>
  );
};

export default JourneyBatchCard;