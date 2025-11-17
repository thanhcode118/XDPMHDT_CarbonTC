import React from 'react';
import styles from './WalletCard.module.css';

const WalletCard = ({ 
  balance = 0,
  value = 0,
  onWithdraw,
  onDeposit 
}) => {
  return (
    <div className={styles.walletCard} data-aos="fade-up">
      <div className={styles.walletHeader}>
        <h2 className={styles.walletTitle}>Số dư tín chỉ</h2>
        <div className={styles.walletIcon}>
          <i className="bi bi-wallet2"></i>
        </div>
      </div>
      <div className={styles.walletBalance}>
        <div className={styles.balanceLabel}>Số dư hiện tại</div>
        <div className={styles.balanceAmount}>{balance}</div>
      </div>
    </div>
  );
};

export default WalletCard;