import React from 'react';
import styles from './TransactionDetailModal.module.css';

const TransactionDetailModal = ({ 
  show, 
  onClose, 
  transaction,
  onDownloadCertificate 
}) => {
  if (!show || !transaction) return null;

  const {
    id,
    type,
    status,
    quantity,
    price,
    totalValue,
    fee,
    date,
    seller,
    buyer,
    timeline = []
  } = transaction;

  const detailItems = [
    { label: 'Mã giao dịch', value: `#${id}` },
    { label: 'Loại giao dịch', value: type === 'sell' ? 'Bán tín chỉ' : 'Mua tín chỉ' },
    { label: 'Ngày giao dịch', value: date },
    { 
      label: 'Trạng thái', 
      value: (
        <span className={`${styles.transactionStatus} ${styles[status]}`}>
          {status === 'completed' ? 'Hoàn thành' : 
           status === 'pending' ? 'Đang xử lý' : 'Đã hủy'}
        </span>
      ) 
    },
    { label: 'Số lượng tín chỉ', value: quantity },
    { label: 'Giá/tín chỉ', value: `${price.toLocaleString()} VNĐ` },
    { label: 'Tổng giá trị', value: `${totalValue.toLocaleString()} VNĐ` },
    { label: 'Phí giao dịch', value: `${fee.amount.toLocaleString()} VNĐ (${fee.percentage}%)` }
  ];

  const defaultTimeline = [
    { date: `${date} 09:30`, action: 'Tạo yêu cầu giao dịch', completed: true },
    { date: `${date} 10:15`, action: 'Người mua xác nhận', completed: true },
    { date: `${date} 11:45`, action: 'Thanh toán thành công', completed: true },
    { date: `${date} 12:00`, action: 'Giao dịch hoàn thành', completed: true }
  ];

  const displayTimeline = timeline.length > 0 ? timeline : defaultTimeline;

  return (
    <div className={`${styles.modal} ${show ? styles.show : ''}`}>
      <div className={styles.modalOverlay} onClick={onClose}></div>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h5 className={styles.modalTitle}>Chi tiết giao dịch</h5>
          <button 
            type="button" 
            className={styles.btnClose}
            onClick={onClose}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.transactionDetailInfo}>
            {detailItems.map((item, index) => (
              <div key={index} className={styles.detailItem}>
                <div className={styles.detailLabel}>{item.label}</div>
                <div className={styles.detailValue}>{item.value}</div>
              </div>
            ))}
          </div>
          
          <div className="row">
            <div className="col-md-6">
              <h6 className={styles.sectionTitle}>Người bán</h6>
              <div className={styles.partyInfo}>
                <img src={seller.avatar} alt="Seller" className={styles.partyAvatar} />
                <div>
                  <div className={styles.partyName}>{seller.name}</div>
                  <div className={styles.partyRole}>{seller.role}</div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <h6 className={styles.sectionTitle}>Người mua</h6>
              <div className={styles.partyInfo}>
                <img src={buyer.avatar} alt="Buyer" className={styles.partyAvatar} />
                <div>
                  <div className={styles.partyName}>{buyer.name}</div>
                  <div className={styles.partyRole}>{buyer.role}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.timelineSection}>
            <h6 className={styles.sectionTitle}>Lịch sử giao dịch</h6>
            <div className={styles.timeline}>
              {displayTimeline.map((item, index) => (
                <div key={index} className={styles.timelineItem}>
                  <div className={styles.timelineIcon}>
                    <div className={`${styles.timelineDot} ${item.completed ? styles.completed : styles.pending}`}>
                      <i className={`bi bi-${item.completed ? 'check' : 'clock'}`}></i>
                    </div>
                    {index < displayTimeline.length - 1 && (
                      <div className={styles.timelineLine}></div>
                    )}
                  </div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineDate}>{item.date}</div>
                    <div className={styles.timelineAction}>{item.action}</div>
                  </div>
                </div>
              ))}
            </div>
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
            onClick={onDownloadCertificate}
          >
            Tải chứng nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;