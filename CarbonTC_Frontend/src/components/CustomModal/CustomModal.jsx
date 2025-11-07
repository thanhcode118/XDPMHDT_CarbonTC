import React from 'react';
import styles from './CustomModal.module.css'; // Sẽ tạo ở bước 3

const CustomModal = ({ show, onClose, onConfirm, title, body, confirmText, danger = false }) => {
  if (!show) {
    return null;
  }

  return (
    // Backdrop (Lớp phủ nền)
    <div className={styles.modalBackdrop} onClick={onClose}>
      
      {/* Modal Content */}
      <div 
        className={styles.modalContent} 
        data-aos="zoom-in" 
        onClick={(e) => e.stopPropagation()} // Ngăn chặn đóng modal khi click vào nội dung
      >
        <div className={styles.modalHeader}>
          <h5 className={styles.modalTitle}>
            {/* Thêm icon cảnh báo nếu là hành động nguy hiểm */}
            {danger && <i className="bi bi-exclamation-triangle-fill"></i>}
            {title}
          </h5>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>

        <div className={styles.modalBody}>
          <p>{body}</p>
        </div>

        <div className={styles.modalFooter}>
          {/* Nút Hủy */}
          <button 
            className={`${styles.btnCustom} ${styles.btnOutlineCustom}`} 
            onClick={onClose}
          >
            Hủy bỏ
          </button>
          
          {/* Nút Xác nhận - Màu đỏ nếu là hành động nguy hiểm */}
          <button 
            className={`${styles.btnCustom} ${danger ? styles.btnDangerCustom : styles.btnPrimaryCustom}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;