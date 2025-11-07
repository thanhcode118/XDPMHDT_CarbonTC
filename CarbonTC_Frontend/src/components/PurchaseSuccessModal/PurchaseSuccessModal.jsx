import React from 'react';
import styles from './PurchaseSuccessModal.module.css';

const PurchaseSuccessModal = ({ 
  isOpen, 
  onClose, 
  transactionData = {} 
}) => {
  if (!isOpen) return null;

  const {
    type = 'buy', // 'buy' hoặc 'bid'
    quantity = 0,
    pricePerUnit = 0,
    totalAmount = 0,
    sellerName = '',
    creditType = 'Carbon Credit',
    transactionId = '',
    estimatedDelivery = '2-3 ngày làm việc'
  } = transactionData;

  const getSuccessMessage = () => {
    return type === 'bid' 
      ? 'Đặt giá thành công!' 
      : 'Mua tín chỉ thành công!';
  };

  const getDescription = () => {
    return type === 'bid'
      ? 'Bạn đã đặt giá thành công cho phiên đấu giá. Chúng tôi sẽ thông báo cho bạn nếu bạn là người chiến thắng.'
      : `Bạn đã mua thành công ${quantity} tín chỉ carbon. Thông tin chi tiết đã được gửi đến email của bạn.`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Thành công</h3>
          <button className={styles.btnClose} onClick={onClose}>
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.successIcon}>
            <i className="bi bi-check-circle-fill"></i>
          </div>
          
          <h4 className={styles.successTitle}>{getSuccessMessage()}</h4>
          <p className={styles.successDescription}>{getDescription()}</p>

          {/* Thông tin giao dịch */}
          <div className={styles.transactionSummary}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Mã giao dịch:</span>
              <span className={styles.summaryValue}>{transactionId || 'Đang xử lý...'}</span>
            </div>
            
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Loại tín chỉ:</span>
              <span className={styles.summaryValue}>{creditType}</span>
            </div>
            
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Số lượng:</span>
              <span className={styles.summaryValue}>{quantity} tín chỉ</span>
            </div>
            
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Đơn giá:</span>
              <span className={styles.summaryValue}>{formatCurrency(pricePerUnit)} VNĐ/tín chỉ</span>
            </div>
            
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Tổng tiền:</span>
              <span className={`${styles.summaryValue} ${styles.totalAmount}`}>
                {formatCurrency(totalAmount)} VNĐ
              </span>
            </div>
            
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Người bán:</span>
              <span className={styles.summaryValue}>{sellerName}</span>
            </div>
            
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Thời gian nhận tín chỉ:</span>
              <span className={styles.summaryValue}>{estimatedDelivery}</span>
            </div>
          </div>

          {/* Lưu ý quan trọng */}
          <div className={styles.importantNotes}>
            <h5 className={styles.notesTitle}>Lưu ý quan trọng:</h5>
            <ul className={styles.notesList}>
              <li>Tín chỉ carbon sẽ được chuyển vào ví của bạn trong vòng {estimatedDelivery}</li>
              <li>Vui lòng kiểm tra email để xem chi tiết hóa đơn</li>
              <li>Liên hệ hỗ trợ nếu bạn có bất kỳ câu hỏi nào</li>
            </ul>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button 
            className={`${styles.btnCustom} ${styles.btnOutlineCustom}`}
            onClick={onClose}
          >
            Đóng
          </button>
          <button 
            className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
            onClick={() => {
              // Có thể thêm hành động xem chi tiết giao dịch
              onClose();
            }}
          >
            Xem chi tiết giao dịch
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessModal;