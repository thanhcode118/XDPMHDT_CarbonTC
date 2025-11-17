import React from 'react';
import styles from './TransactionItem.module.css';

const capitalize = (value = '') => value.charAt(0).toUpperCase() + value.slice(1);

const TransactionItem = ({ transaction }) => {
  const {
    title,
    description,
    date,
    statusText,
    variant = 'deposit',
    amountDisplay = { prefix: '', value: '', strike: false }
  } = transaction;

  const amountClass = styles[`amount${capitalize(variant)}`] || '';
  const statusClass = styles[`status${capitalize(variant)}`] || '';

  return (
    <tr className={styles.row}>
      <td>
        <div className={styles.cellTitle}>{title}</div>
        {description && <div className={styles.cellSubtitle}>{description}</div>}
      </td>
      <td>
        <span className={`${styles.statusBadge} ${statusClass}`}>
          {statusText}
        </span>
      </td>
      <td className={`${styles.amount} ${amountClass} ${amountDisplay.strike ? styles.amountStrike : ''}`}>
        {amountDisplay.prefix}{amountDisplay.value}
      </td>
      <td className={styles.dateCell}>{date}</td>
    </tr>
  );
};

export default TransactionItem;