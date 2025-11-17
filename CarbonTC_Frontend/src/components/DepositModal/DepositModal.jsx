import React, { useEffect, useMemo, useState } from 'react';
import styles from './DepositModal.module.css';

const defaultStatus = {
  state: 'idle',
  message: '',
  paymentUrl: ''
};

const DepositModal = ({
  show,
  onClose,
  onSubmit,
  submitting = false,
  status = defaultStatus,
  minAmount = 10000
}) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});

  const currentStatus = useMemo(() => ({ ...defaultStatus, ...status }), [status]);

  useEffect(() => {
    if (!show) {
      resetForm();
    } else if (currentStatus.state === 'idle') {
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, currentStatus.state]);

  const resetForm = () => {
    setAmount('');
    setNote('');
    setAgreeTerms(false);
    setErrors({});
  };

  // Format hiển thị lên input
  const formatVND = (value) => {
    if (!value) return "";
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const validate = () => {
    const nextErrors = {};
    const numericAmount = Number(amount); // số thật không dấu

    if (!amount || numericAmount < minAmount) {
      nextErrors.amount = `Số tiền tối thiểu là ${minAmount.toLocaleString('vi-VN')} VNĐ`;
    }

    if (!agreeTerms) {
      nextErrors.agreeTerms = 'Bạn cần đồng ý với điều khoản nạp tiền';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!onSubmit) return;

    try {
      await onSubmit(Number(amount), note);
    } catch (_) {}
  };

  const handleContinuePayment = () => {
    if (currentStatus.paymentUrl) {
      window.open(currentStatus.paymentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!show) return null;

  return (
    <div className={`${styles.modal} ${show ? styles.show : ''}`}>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modalContent} data-aos="zoom-in" onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div>
            <p className={styles.meta}>Nạp tiền vào ví</p>
            <h3 className={styles.title}>Tạo giao dịch nạp tiền</h3>
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            disabled={submitting}
            aria-label="Đóng"
          >
            <i className="bi bi-x-lg" />
          </button>
        </header>

        {currentStatus.state === 'success' ? (
          <div className={styles.resultState}>
            <div className={`${styles.statusIcon} ${styles.success}`}>
              <i className="bi bi-check2-circle" />
            </div>
            <h4>Đã tạo yêu cầu nạp tiền</h4>
            <p className={styles.message}>
              {currentStatus.message || 'Bạn có thể tiếp tục tới cổng thanh toán để hoàn tất giao dịch.'}
            </p>
            {currentStatus.paymentUrl ? (
              <button className={`${styles.btn} ${styles.primary}`} onClick={handleContinuePayment}>
                Tiếp tục thanh toán
              </button>
            ) : (
              <p className={styles.helperText}>
                Vui lòng kiểm tra email hoặc lịch sử giao dịch để biết thêm chi tiết.
              </p>
            )}
            <button className={`${styles.btn} ${styles.outline}`} onClick={onClose}>
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.body}>
              <div className={styles.formGroup}>
                <label htmlFor="depositAmount">Số tiền muốn nạp (VNĐ)</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.prefix}>₫</span>

                  {/* --- INPUT HIỂN THỊ CÓ DẤU CHẤM --- */}
                  <input
                    id="depositAmount"
                    type="text"
                    value={formatVND(amount)}
                    onChange={(e) => {
                      const numeric = e.target.value.replace(/\D/g, ""); // giá trị thật
                      setAmount(numeric);
                    }}
                    placeholder={`Tối thiểu ${minAmount.toLocaleString('vi-VN')} VNĐ`}
                    className={errors.amount ? styles.error : ''}
                    disabled={submitting}
                  />
                </div>

                {errors.amount && <p className={styles.errorMessage}>{errors.amount}</p>}

                <p className={styles.helperText}>
                  Số tiền sau khi xác nhận sẽ chuyển sang cổng thanh toán VNPay để hoàn tất.
                </p>
              </div>

              {currentStatus.state === 'error' && (
                <div className={styles.alert}>
                  <i className="bi bi-exclamation-triangle-fill" />
                  {currentStatus.message || 'Không thể tạo yêu cầu nạp tiền. Vui lòng thử lại.'}
                </div>
              )}

              <div className={styles.terms}>
                <label>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    disabled={submitting}
                  />
                  Tôi đã đọc và đồng ý với điều khoản nạp tiền, bao gồm phí giao dịch (nếu có).
                </label>
                {errors.agreeTerms && <p className={styles.errorMessage}>{errors.agreeTerms}</p>}
              </div>
            </div>

            <footer className={styles.footer}>
              <button
                type="button"
                className={`${styles.btn} ${styles.outline}`}
                onClick={onClose}
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className={`${styles.btn} ${styles.primary}`}
                disabled={submitting}
              >
                {submitting ? 'Đang tạo yêu cầu...' : 'Tạo yêu cầu nạp tiền'}
              </button>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
};

export default DepositModal;