import React, { useEffect, useMemo, useState } from 'react';
import styles from './PaymentReturn.module.css';
import { getMyEWallet } from '../../services/walletService.jsx';
import { useNotification } from '../../hooks/useNotification.jsx';

const PaymentReturn = () => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(null);

  const allParams = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const obj = {};
    for (const [key, value] of params.entries()) {
      obj[key] = value;
    }
    return obj;
  }, []);

  useEffect(() => {
    // FE chỉ đọc query params do BE redirect về
    const isSuccess = String(allParams.success || '').toLowerCase() === 'true' || allParams.vnp_ResponseCode === '00';
    setSuccess(isSuccess);
    setMessage(isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại');
    showNotification(isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại', isSuccess ? 'success' : 'error');

    // Gọi lại ví tiền để refetch số dư mới nhất
    (async () => {
      try {
        await getMyEWallet();
      } catch (_) { /* ignore */ }
      setLoading(false);
    })();
  }, [allParams, showNotification]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {loading ? (
          <div className={styles.center}>
            <i className="bi bi-arrow-repeat"></i>
            <p>Đang xác thực giao dịch...</p>
          </div>
        ) : (
          <div className={styles.resultBox}>
            <div className={`${styles.statusIcon} ${success ? styles.ok : styles.fail}`}>
              <i className={`bi ${success ? 'bi-check-circle' : 'bi-x-circle'}`}></i>
            </div>
            <h2 className={styles.title}>{success ? 'Thanh toán thành công' : 'Thanh toán thất bại'}</h2>
            <p className={styles.message}>{message}</p>
            <div className={styles.actions}>
              <a href="/dashboard/wallet" className={`${styles.btn} ${styles.primary}`}>Về trang Ví</a>
              <a href="/" className={`${styles.btn} ${styles.outline}`}>Trang chủ</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentReturn;


