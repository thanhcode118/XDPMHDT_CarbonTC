import React, { useEffect, useMemo, useState } from 'react';
import styles from './PaymentReturn.module.css';
import { vnpayReturn } from '../../utils/walletApi.jsx';
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
    const run = async () => {
      try {
        const res = await vnpayReturn(allParams);
        setSuccess(Boolean(res?.success));
        setMessage(res?.message || res?.data || 'Hoàn tất xử lý thanh toán');
        showNotification(res?.message || 'Kết quả thanh toán đã được cập nhật', res?.success ? 'success' : 'error');
      } catch (e) {
        setSuccess(false);
        setMessage('Không thể xác thực kết quả thanh toán');
        showNotification('Không thể xác thực kết quả thanh toán', 'error');
      } finally {
        setLoading(false);
      }
    };
    run();
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


