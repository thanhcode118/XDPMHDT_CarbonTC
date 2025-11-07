import React from 'react';
import styles from './TransactionItem.module.css';

// --- (1. TẠO HELPER MAP STATUS) ---
const getStatusDetails = (statusEnum) => {
  // Giả định: 1: Pending, 2: Completed, 3: Cancelled, 4: Failed
  switch (statusEnum) {
    case 1:
      return { text: 'Đang xử lý', className: 'pending' };
    case 2:
      return { text: 'Hoàn thành', className: 'completed' };
    case 3:
      return { text: 'Đã hủy', className: 'cancelled' };
    case 4:
      return { text: 'Thất bại', className: 'failed' }; // Giả định
    default:
      return { text: 'Không rõ', className: 'unknown' };
  }
};

const TransactionItem = ({ 
  transaction,
  transactionType, // <-- (2. THÊM PROP MỚI: 'sales' hoặc 'purchases')
  onViewDetails,
  onCancel 
}) => {
  
  // --- (3. MAP DỮ LIỆU TỪ API) ---
  const {
    id,
    status: statusEnum,
    quantity,
    totalAmount,
    sellerId,
    buyerId,
  } = transaction;

  // Tính toán các giá trị bị thiếu
  const status = getStatusDetails(statusEnum);
  const pricePerUnit = quantity > 0 ? (totalAmount / quantity) : 0;
  
  // LƯU Ý: API không trả về tên/avatar. Chúng ta phải hiển thị tạm
  // Hoặc bạn cần gọi API /users/{id} để lấy thông tin.
  // Ở đây, chúng ta sẽ hiển thị theo vai trò:
  const isSelling = transactionType === 'sales';
  
  const party = {
      name: isSelling ? `Người mua: ...${buyerId.slice(-6)}` : `Người bán: ...${sellerId.slice(-6)}`,
      avatar: `https://i.pravatar.cc/30?u=${isSelling ? buyerId : sellerId}`
  };

  return (
    <div className={styles.transactionItem}>
      <div className={styles.transactionHeader}>
        <div className={styles.transactionId}>#{id.slice(0, 8)}...</div>
        <div className={`${styles.transactionStatus} ${styles[status.className]}`}>
          {status.text}
        </div>
      </div>
      <div className={styles.transactionDetails}>
        <div className={styles.transactionDetail}>
          <div className={styles.transactionDetailValue}>{quantity.toLocaleString()}</div>
          <div className={styles.transactionDetailLabel}>Số lượng</div>
        </div>
        <div className={styles.transactionDetail}>
          <div className={styles.transactionDetailValue}>{totalAmount.toLocaleString()}</div>
          <div className={styles.transactionDetailLabel}>Tổng giá trị (VNĐ)</div>
        </div>
        <div className={styles.transactionDetail}>
          <div className={styles.transactionDetailValue}>{pricePerUnit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          <div className={styles.transactionDetailLabel}>Giá/tín chỉ</div>
        </div>
      </div>
      
      {/* (4. CHỈ HIỂN THỊ 1 BÊN GIAO DỊCH) */}
      <div className={styles.transactionParties}>
        <div className={styles.transactionParty}>
          <img src={party.avatar} alt="Party" className={styles.partyAvatar} />
          <div className={styles.partyName}>{party.name}</div>
        </div>
      </div>

      <div className={styles.transactionActions}>
        {/* Chỉ cho phép hủy khi đang xử lý */}
        {statusEnum === 1 && (
          <button 
            className={`${styles.btnCustom} ${styles.btnOutlineCustom} ${styles.btnSm}`}
            onClick={() => onCancel(id)}
          >
            Hủy
          </button>
        )}
        <button 
          className={`${styles.btnCustom} ${styles.btnPrimaryCustom} ${styles.btnSm}`}
          onClick={() => onViewDetails(transaction)}
        >
          Chi tiết
        </button>
      </div>
    </div>
  );
};

export default TransactionItem;