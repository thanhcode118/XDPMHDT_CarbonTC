import React from 'react';
import styles from './CreditSelector.module.css'; 

const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleDateString('vi-VN');
};

const CreditSelector = ({ credits, selectedCreditId, onSelectCredit, isLoading, error }) => {
  
  if (isLoading) {
    return (
      <div className={styles.creditSelectorSection}>
        <h4 className={styles.sectionTitle}>Chọn nguồn tín chỉ</h4>
        <p>Đang tải danh sách tín chỉ của bạn...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.creditSelectorSection}>
        <h4 className={styles.sectionTitle}>Chọn nguồn tín chỉ</h4>
        <p className={styles.textDanger}>Lỗi: {error}</p>
      </div>
    );
  }

  if (credits.length === 0) {
    return (
      <div className={styles.creditSelectorSection}>
        <h4 className={styles.sectionTitle}>Chọn nguồn tín chỉ</h4>
        <p>Bạn không có nguồn tín chỉ nào (đã xác minh) để niêm yết.</p>
      </div>
    );
  }

  return (
    <div className={styles.creditSelectorSection} data-aos="fade-up">
      <h4 className={styles.sectionTitle}>Chọn nguồn tín chỉ</h4>
      <div className={styles.creditList}>
        {credits.map(credit => (
          <label 
            key={credit.creditId} 
            className={`${styles.creditItem} ${selectedCreditId === credit.creditId ? styles.selected : ''}`}
          >
            <input 
              type="radio"
              name="creditSource"
              value={credit.creditId}
              checked={selectedCreditId === credit.creditId}
              onChange={() => onSelectCredit(credit.creditId)}
              className={styles.radioInput}
            />
            
            <div className={styles.creditDetails}>
              <div className={styles.creditHeader}>
                <strong title={credit.creditSerialNumber}>
                  {credit.creditSerialNumber || `ID: ...${credit.creditId.slice(-8)}`}
                </strong>
                <span className={styles.creditAmount} title="Tổng số lượng">
                  {credit.amount} CCs
                </span>
              </div>
              <div className={styles.creditInfo}>
                <span>Loại: <strong>{credit.creditType || 'N/A'}</strong></span>
                <span>Năm: <strong>{credit.vintage || 'N/A'}</strong></span>
                <span>Phát hành: <strong>{formatDate(credit.issuedAt)}</strong></span>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CreditSelector;