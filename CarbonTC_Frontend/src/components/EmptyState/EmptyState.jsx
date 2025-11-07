import React from 'react';
import styles from './EmptyState.module.css';

const EmptyState = ({ 
  icon = 'bi-ev-station',
  title,
  description,
  actionText,
  onAction 
}) => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <i className={`bi ${icon}`}></i>
      </div>
      <h2 className={styles.emptyTitle}>{title}</h2>
      <p className={styles.emptyDescription}>{description}</p>
      <button 
        className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
        onClick={onAction}
      >
        <i className="bi bi-plus-circle me-2"></i>
        {actionText}
      </button>
    </div>
  );
};

export default EmptyState;