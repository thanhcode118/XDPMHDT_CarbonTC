import React, { useEffect, useMemo } from 'react';
import styles from './PaymentReturn.module.css';
import { useNotification } from '../../hooks/useNotification.jsx';
import { getMyEWallet } from '../../services/walletService.jsx';

const PaymentFail = () => {
  const { showNotification } = useNotification();

  const allParams = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const obj = {};
    for (const [key, value] of params.entries()) {
      obj[key] = value;
    }
    return obj;
  }, []);

  useEffect(() => {
    showNotification(allParams.message || 'Thanh toán thất bại', 'error');

    (async () => {
      try {
        await getMyEWallet();
      } catch (_) {
        // ignore balance refresh errors
      }
    })();
  }, [allParams, showNotification]);

  const transactionDetails = [
    { label: 'Mã giao dịch', value: allParams.vnp_TxnRef || allParams.transactionId },
    { label: 'Mã phản hồi', value: allParams.vnp_ResponseCode || allParams.responseCode },
    { label: 'Thông báo', value: allParams.message }
  ].filter((item) => item.value);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.resultBox}>
          <div className={`${styles.statusIcon} ${styles.fail}`}>
            <i className="bi bi-x-circle"></i>
          </div>
          <h2 className={styles.title}>Thanh toán thất bại</h2>
          <p className={styles.message}>
            {allParams.message
              ? decodeURIComponent(allParams.message)
              : 'Hệ thống đang tạm thời gián đoạn, vui lòng thử lại sau hoặc liên hệ hỗ trợ.'}
          </p>

          {transactionDetails.length > 0 && (
            <div className={styles.detailCard}>
              <h4>Chi tiết giao dịch</h4>
              <ul className={styles.detailList}>
                {transactionDetails.map((detail, index) => (
                  <li key={`${detail.label}-${index}`} className={styles.detailItem}>
                    <span className={styles.detailLabel}>{detail.label}</span>
                    <span className={styles.detailValue}>{detail.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.actions}>
            <a href="/dashboard/wallet" className={`${styles.btn} ${styles.primary}`}>
              Thử nạp lại
            </a>
            <a href="/" className={`${styles.btn} ${styles.outline}`}>
              Trang chủ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;

