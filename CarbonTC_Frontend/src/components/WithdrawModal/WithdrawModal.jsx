import React, { useState, useEffect } from 'react';
import styles from './WithdrawModal.module.css';

const WithdrawModal = ({ 
  show, 
  onClose, 
  onConfirm,
  availableBalance = 0,
  mode = 'credit', // 'credit' | 'money'
  submitting = false,
  serverError = ''
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    method: '',
    bankAccount: '',
    bankName: '',
    ewalletType: '',
    phoneNumber: '',
    agreeTerms: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!show) {
      // Reset form when modal closes
      setFormData({
        amount: '',
        method: '',
        bankAccount: '',
        bankName: '',
        ewalletType: '',
        phoneNumber: '',
        agreeTerms: false
      });
      setErrors({});
    }
  }, [show]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || formData.amount < (mode === 'money' ? 10000 : 1)) {
      newErrors.amount = mode === 'money'
        ? 'Vui lòng nhập số tiền hợp lệ (>= 10,000 VNĐ)'
        : 'Vui lòng nhập số lượng tín chỉ hợp lệ';
    } else if (formData.amount > availableBalance) {
      newErrors.amount = mode === 'money'
        ? `Số tiền không được vượt quá ${availableBalance.toLocaleString('vi-VN')} VNĐ`
        : `Số lượng không được vượt quá ${availableBalance} tín chỉ`;
    }

    if (!formData.method) {
      newErrors.method = 'Vui lòng chọn phương thức rút tiền';
    }

    if (formData.method === 'bank') {
      if (!formData.bankAccount) {
        newErrors.bankAccount = 'Vui lòng nhập số tài khoản';
      }
      if (!formData.bankName) {
        newErrors.bankName = 'Vui lòng chọn ngân hàng';
      }
    }

    if (formData.method === 'ewallet') {
      if (!formData.ewalletType) {
        newErrors.ewalletType = 'Vui lòng chọn loại ví';
      }
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
      }
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Vui lòng đồng ý với điều khoản';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (onConfirm) {
        try {
          await onConfirm(formData);
        } catch (_) {
          // Parent handles error state; keep modal open
        }
      }
    }
  };

  const handleClose = () => {
    setFormData({
      amount: '',
      method: '',
      bankAccount: '',
      bankName: '',
      ewalletType: '',
      phoneNumber: '',
      agreeTerms: false
    });
    setErrors({});
    onClose();
  };

  if (!show) return null;

  return (
    <div className={`${styles.modal} ${show ? styles.show : ''}`}>
      <div className={styles.modalOverlay} onClick={handleClose}></div>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h5 className={styles.modalTitle}>Rút tiền</h5>
          <button 
            type="button" 
            className={styles.btnClose}
            onClick={handleClose}
            disabled={submitting}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label htmlFor="withdrawAmount" className={styles.formLabel}>
                {mode === 'money' ? 'Số tiền rút (VNĐ)' : 'Số lượng tín chỉ'}
              </label>
              <input 
                type="number" 
                className={`${styles.formControl} ${errors.amount ? styles.error : ''}`}
                id="withdrawAmount" 
                name="amount"
                placeholder={mode === 'money' ? 'Nhập số tiền (VNĐ)' : 'Nhập số lượng tín chỉ'} 
                min={mode === 'money' ? 10000 : 1}
                max={availableBalance}
                value={formData.amount}
                onChange={handleInputChange}
                required
                />
              {errors.amount && (
                <div className={styles.errorMessage}>{errors.amount}</div>
              )}
              <small className={styles.helperText}>
                {mode === 'money' 
                  ? `Bạn có ${Number(availableBalance).toLocaleString('vi-VN')} VNĐ khả dụng`
                  : `Bạn có ${availableBalance} tín chỉ khả dụng`}
              </small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="withdrawMethod" className={styles.formLabel}>
                Phương thức rút tiền
              </label>
              <select 
                className={`${styles.formSelect} ${errors.method ? styles.error : ''}`}
                id="withdrawMethod" 
                name="method"
                value={formData.method}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Chọn phương thức</option>
                <option value="bank">Chuyển khoản ngân hàng</option>
                <option value="ewallet">Ví điện tử</option>
                <option value="crypto">Tiền điện tử</option>
              </select>
              {errors.method && (
                <div className={styles.errorMessage}>{errors.method}</div>
              )}
            </div>

            {formData.method === 'bank' && (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="bankAccount" className={styles.formLabel}>
                    Số tài khoản
                  </label>
                  <input 
                    type="text" 
                    className={`${styles.formControl} ${errors.bankAccount ? styles.error : ''}`}
                    id="bankAccount" 
                    name="bankAccount"
                    placeholder="Nhập số tài khoản"
                    value={formData.bankAccount}
                    onChange={handleInputChange}
                  />
                  {errors.bankAccount && (
                    <div className={styles.errorMessage}>{errors.bankAccount}</div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="bankName" className={styles.formLabel}>
                    Ngân hàng
                  </label>
                  <select 
                    className={`${styles.formSelect} ${errors.bankName ? styles.error : ''}`}
                    id="bankName" 
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                  >
                    <option value="" disabled>Chọn ngân hàng</option>
                    <option value="vcb">Vietcombank</option>
                    <option value="tcb">Techcombank</option>
                    <option value="mb">MB Bank</option>
                    <option value="vib">VIB</option>
                    <option value="other">Khác</option>
                  </select>
                  {errors.bankName && (
                    <div className={styles.errorMessage}>{errors.bankName}</div>
                  )}
                </div>
              </>
            )}

            {formData.method === 'ewallet' && (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="ewalletType" className={styles.formLabel}>
                    Loại ví
                  </label>
                  <select 
                    className={`${styles.formSelect} ${errors.ewalletType ? styles.error : ''}`}
                    id="ewalletType" 
                    name="ewalletType"
                    value={formData.ewalletType}
                    onChange={handleInputChange}
                  >
                    <option value="" disabled>Chọn loại ví</option>
                    <option value="momo">MoMo</option>
                    <option value="zalopay">ZaloPay</option>
                    <option value="vnpay">VNPay</option>
                  </select>
                  {errors.ewalletType && (
                    <div className={styles.errorMessage}>{errors.ewalletType}</div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phoneNumber" className={styles.formLabel}>
                    Số điện thoại
                  </label>
                  <input 
                    type="tel" 
                    className={`${styles.formControl} ${errors.phoneNumber ? styles.error : ''}`}
                    id="phoneNumber" 
                    name="phoneNumber"
                    placeholder="Nhập số điện thoại"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                  />
                  {errors.phoneNumber && (
                    <div className={styles.errorMessage}>{errors.phoneNumber}</div>
                  )}
                </div>
              </>
            )}

            <div className={styles.formGroup}>
              <div className={styles.formCheck}>
                <input 
                  className={`${styles.formCheckInput} ${errors.agreeTerms ? styles.error : ''}`}
                  type="checkbox" 
                  id="agreeTerms" 
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  required
                />
                <label className={styles.formCheckLabel} htmlFor="agreeTerms">
                  Tôi đồng ý với các điều khoản và điều kiện rút tiền
                </label>
              </div>
              {errors.agreeTerms && (
                <div className={styles.errorMessage}>{errors.agreeTerms}</div>
              )}
            </div>
          </div>
          <div className={styles.modalFooter}>
            {serverError && (
              <div className={styles.serverError}>
                <i className="bi bi-exclamation-triangle me-2"></i>
                {serverError}
              </div>
            )}
            <button 
              type="button" 
              className={`${styles.btnCustom} ${styles.btnOutlineCustom}`}
              onClick={handleClose}
              disabled={submitting}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
              disabled={submitting}
            >
              {submitting ? 'Đang xử lý...' : 'Xác nhận'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawModal;