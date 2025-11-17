import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './PaymentReturn.module.css';
import { getMyEWallet } from '../../services/walletService.jsx';
import { useNotification } from '../../hooks/useNotification.jsx';

const PaymentReturn = () => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const allParams = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const obj = {};
    for (const [key, value] of params.entries()) {
      obj[key] = value;
    }
    return obj;
  }, []);

  const transactionDetails = useMemo(() => {
    const amountRaw = allParams.vnp_Amount || allParams.amount;
    const amountValue = amountRaw ? Number(amountRaw) / (allParams.vnp_Amount ? 100 : 1) : null;
    const formattedAmount = typeof amountValue === 'number' && !Number.isNaN(amountValue)
      ? amountValue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
      : null;

    return [
      { label: 'Mã giao dịch', value: allParams.vnp_TxnRef || allParams.transactionId },
      { label: 'Số tiền', value: formattedAmount },
      { label: 'Ngân hàng', value: allParams.vnp_BankCode },
      { label: 'Thời gian thanh toán', value: allParams.vnp_PayDate },
      { label: 'Mã phản hồi', value: allParams.vnp_ResponseCode || allParams.responseCode }
    ].filter((item) => item.value);
  }, [allParams]);

  const refreshBalance = useCallback(async () => {
    setRefreshing(true);
    try {
      await getMyEWallet();
      showNotification('Đã cập nhật số dư ví', 'success');
    } catch (_) {
      showNotification('Không thể cập nhật số dư ví', 'error');
    } finally {
      setRefreshing(false);
    }
  }, [showNotification]);

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
              <button
                className={`${styles.btn} ${styles.primary}`}
                onClick={refreshBalance}
                disabled={refreshing}
              >
                {refreshing ? 'Đang cập nhật...' : 'Làm mới số dư'}
              </button>
              <a href="/dashboard/wallet" className={`${styles.btn} ${styles.outline}`}>Về trang Ví</a>
              <a href="/" className={`${styles.btn} ${styles.outline}`}>Trang chủ</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentReturn;


