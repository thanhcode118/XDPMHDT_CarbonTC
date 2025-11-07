import React from 'react';
import styles from './WalletCard.module.css';

const MoneyWalletCard = ({ 
  value = 0,
  onWithdraw,
  onDeposit 
}) => {
  return (
    <div className={styles.walletCard} data-aos="fade-up">
      <div className={styles.walletHeader}>
        <h2 className={styles.walletTitle}>Số dư ví tiền</h2>
        <div className={styles.walletIcon}>
          <i className="bi bi-cash-stack"></i>
        </div>
      </div>
      <div className={styles.walletBalance}>
        <div className={styles.balanceLabel}>Số dư hiện tại (VNĐ)</div>
        <div className={styles.balanceAmount}>{Number(value).toLocaleString('vi-VN')}</div>
      </div>
      <div className={styles.walletActions}>
        <button 
          className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
          onClick={onWithdraw}
        >
          <i className="bi bi-arrow-down-circle me-2"></i>Rút tiền
        </button>
        <button 
          className={`${styles.btnCustom} ${styles.btnOutlineCustom}`}
          onClick={onDeposit}
        >
          <i className="bi bi-arrow-up-circle me-2"></i>Nạp tiền
        </button>
      </div>
    </div>
  );
};

export default MoneyWalletCard;


