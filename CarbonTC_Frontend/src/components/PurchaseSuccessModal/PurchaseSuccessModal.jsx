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
    estimatedDelivery = '2-3 ngày làm việc',
    bidTime = '',
    listingId = ''
  } = transactionData;

  const formatBidTime = (isoTime) => {
      if (!isoTime) return '';
      const vnTime = convertUTCToVnTime(isoTime);
      return vnTime.toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
      });
  };

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

  const handleViewDetails = () => {
    if (type === 'buy') {
      // Chuyển hướng đến trang transactions cho loại buy
      window.location.href = 'http://localhost:5173/dashboard/transactions';
    } else {
      // Đóng modal cho loại bid (vì chưa biết kết quả đấu giá)
      onClose();
    }
  };

  const getButtonText = () => {
    return type === 'bid' ? 'Theo dõi đấu giá' : 'Xem chi tiết giao dịch';
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

          {/* Thông tin giao dịch - CHỈ HIỆN VỚI LOẠI BUY */}
          {type === 'buy' && (
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
          )}

          {/* Thông tin đấu giá - CHỈ HIỆN VỚI LOẠI BID */}
          {type === 'bid' && (
            <div className={styles.bidSummary}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Mã phiên đấu giá:</span>
                <span className={styles.summaryValue}>{listingId ? `...${listingId.slice(-8)}` : 'N/A'}</span>
              </div>
              
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Giá đã đặt:</span>
                <span className={styles.summaryValue}>{formatCurrency(pricePerUnit)} VNĐ/tín chỉ</span>
              </div>
              
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Số lượng:</span>
                <span className={styles.summaryValue}>{quantity} tín chỉ</span>
              </div>
              
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Tổng giá trị:</span>
                <span className={`${styles.summaryValue} ${styles.totalAmount}`}>
                  {formatCurrency(pricePerUnit*quantity)} VNĐ
                </span>
              </div>
              
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Thời gian đặt giá:</span>
                <span className={styles.summaryValue}>{formatBidTime(bidTime)}</span>
              </div>
            </div>
          )}

          {/* Lưu ý quan trọng - KHÁC NHAU CHO TỪNG LOẠI */}
          <div className={styles.importantNotes}>
            <h5 className={styles.notesTitle}>Lưu ý quan trọng:</h5>
            <ul className={styles.notesList}>
              {type === 'buy' ? (
                <>
                  <li>Tín chỉ carbon sẽ được chuyển vào ví của bạn trong vòng {estimatedDelivery}</li>
                  <li>Vui lòng kiểm tra email để xem chi tiết hóa đơn</li>
                  <li>Liên hệ hỗ trợ nếu bạn có bất kỳ câu hỏi nào</li>
                </>
              ) : (
                <>
                  <li>Phiên đấu giá vẫn đang tiếp diễn, bạn có thể bị vượt giá bất cứ lúc nào</li>
                  <li>Chúng tôi sẽ thông báo ngay nếu bạn là người chiến thắng khi đấu giá kết thúc</li>
                  <li>Theo dõi phiên đấu giá để cập nhật tình hình mới nhất</li>
                  <li>Giá của bạn: <strong>{formatCurrency(pricePerUnit)} VNĐ/tín chỉ</strong></li>
                </>
              )}
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
            onClick={handleViewDetails}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessModal;