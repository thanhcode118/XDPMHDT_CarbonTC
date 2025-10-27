import React from 'react';
// Import CSS Module của thông báo
import styles from './AlertBox.module.css'; 

/**
 * Component hiển thị hộp thông báo lỗi/thành công (Alert/Toast)
 * @param {object} props - Props của component
 * @param {object} props.message - Đối tượng chứa thông tin thông báo
 * @param {string} props.message.type - Loại thông báo ('success' hoặc 'error')
 * @param {string} props.message.text - Nội dung chi tiết của thông báo
 */
const AlertBox = ({ message }) => {
  // Không hiển thị nếu không có tin nhắn hoặc nội dung tin nhắn
  if (!message || !message.text) {
    return null;
  }

  return (
    <div
      // Áp dụng CSS từ module và CSS đã tinh chỉnh
      className={`${styles.alertBox} ${
        message.type === 'success' ? styles.alertSuccess : styles.alertError
      }`}
      // Dùng data-aos để áp dụng hiệu ứng fade-in mượt mà (nếu bạn có AOS)
      data-aos="fade-down" 
    >
      <div className={styles.alertIcon}>
        {message.type === 'success' ? (
          // Icon Thành công
          <i className="bi bi-check-circle-fill"></i> 
        ) : (
          // Icon Lỗi/Thất bại
          <i className="bi bi-exclamation-triangle-fill"></i>
        )}
      </div>
      <div className={styles.alertContent}>
        <strong>
          {/* Tiêu đề thông báo dựa trên loại */}
          {message.type === 'success' ? 'Thành công!' : 'Thất bại!'}
        </strong>
        <p>{message.text}</p>
      </div>
    </div>
  );
};

export default AlertBox;