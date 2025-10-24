import React from 'react';
import styles from './TransactionItem.module.css';

const TransactionItem = ({ 
  transaction 
}) => {
  const {
    id,
    type,
    title,
    date,
    amount,
    icon = 'bi-arrow-down-circle'
  } = transaction;

  const isIncome = type === 'income';

  return (
    <div className={styles.transactionItem}>
      <div className={`${styles.transactionIcon} ${isIncome ? styles.transactionIconIncome : styles.transactionIconExpense}`}>
        <i className={`bi ${icon}`}></i>
      </div>
      <div className={styles.transactionDetails}>
        <div className={styles.transactionTitle}>{title}</div>
        <div className={styles.transactionDate}>{date}</div>
      </div>
      <div className={`${styles.transactionAmount} ${isIncome ? styles.amountPositive : styles.amountNegative}`}>
        {isIncome ? '+' : '-'}{amount}
      </div>
    </div>
  );
};

export default TransactionItem;