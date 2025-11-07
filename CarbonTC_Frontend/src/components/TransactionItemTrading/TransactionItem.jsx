import React from 'react';
import styles from './TransactionItem.module.css';

const TransactionItem = ({ 
  transaction,
  onViewDetails,
  onCancel 
}) => {
  const {
    id,
    status,
    type,
    quantity,
    price,
    totalValue,
    seller,
    buyer,
    date
  } = transaction;

  return (
    <div className={styles.transactionItem}>
      <div className={styles.transactionHeader}>
        <div className={styles.transactionId}>#{id}</div>
        <div className={`${styles.transactionStatus} ${styles[status]}`}>
          {status === 'completed' ? 'Hoàn thành' : 
           status === 'pending' ? 'Đang xử lý' : 'Đã hủy'}
        </div>
      </div>
      <div className={styles.transactionDetails}>
        <div className={styles.transactionDetail}>
          <div className={styles.transactionDetailValue}>{quantity}</div>
          <div className={styles.transactionDetailLabel}>Số lượng tín chỉ</div>
        </div>
        <div className={styles.transactionDetail}>
          <div className={styles.transactionDetailValue}>{totalValue.toLocaleString()}</div>
          <div className={styles.transactionDetailLabel}>Giá trị (VNĐ)</div>
        </div>
        <div className={styles.transactionDetail}>
          <div className={styles.transactionDetailValue}>{price.toLocaleString()}</div>
          <div className={styles.transactionDetailLabel}>Giá/tín chỉ</div>
        </div>
      </div>
      <div className={styles.transactionParties}>
        <div className={styles.transactionParty}>
          <img src={seller.avatar} alt="Seller" className={styles.partyAvatar} />
          <div className={styles.partyName}>{seller.name}</div>
        </div>
        <div className={styles.transactionParty}>
          <img src={buyer.avatar} alt="Buyer" className={styles.partyAvatar} />
          <div className={styles.partyName}>{buyer.name}</div>
        </div>
      </div>
      <div className={styles.transactionActions}>
        {status === 'pending' && (
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