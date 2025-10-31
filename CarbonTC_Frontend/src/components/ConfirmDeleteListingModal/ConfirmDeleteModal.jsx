import React from 'react';
import styles from '../../pages/Marketplace/Marketplace.module.css'; 

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, isLoading, error }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalStyle} onClick={onClose}>
      <div className={styles.modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.filterTitle} style={{ color: '#dc3545', marginTop: 0 }}>
          Xác nhận hủy niêm yết?
        </h3>
        
        <p style={{ fontSize: '16px', color: '#ffffffff', margin: '15px 0 25px 0' }}>
          Bạn có chắc chắn muốn hủy vĩnh viễn niêm yết này không?
          <br/>
          <strong>Hành động này không thể hoàn tác.</strong>
        </p>

        {error && (
          <div className={styles.errorStyle}>
            <strong>Không thể hủy:</strong> {error}
          </div>
        )}

        <div className="col-12 d-flex justify-content-center gap-3" style={{marginTop: '25px'}}>
          <button 
            type="button" 
            className={`${styles.btnCustom} ${styles.btnOutlineCustom}`} 
            onClick={onClose}
            disabled={isLoading}
          >
            Đóng
          </button>
          <button 
            type="button" 
            className={`${styles.btnCustom} ${styles.btnDangerCustom}`} 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Đang hủy...' : 'Xác nhận hủy'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;