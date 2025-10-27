import React from 'react';
// Tái sử dụng styles từ Marketplace cho nhất quán
import styles from '../../pages/Marketplace/Marketplace.module.css'; 

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, isLoading, error }) => {
  if (!isOpen) return null;

  // CSS cho modal (tương tự EditModal)
  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001, // Đảm bảo nổi trên EditModal nếu có
    padding: '20px'
  };

  const modalContentStyle = {
    backgroundColor: '#242222ff',
    borderRadius: '8px',
    padding: '20px 30px',
    width: '100%',
    maxWidth: '450px',
    textAlign: 'center'
  };

  const errorStyle = {
    color: '#dc3545',
    backgroundColor: '#1c1c1cff',
    border: '1px solid #f5c2c7',
    borderRadius: '4px',
    padding: '10px',
    marginTop: '15px',
    textAlign: 'left'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.filterTitle} style={{ color: '#dc3545', marginTop: 0 }}>
          Xác nhận hủy niêm yết?
        </h3>
        
        <p style={{ fontSize: '16px', color: '#ffffffff', margin: '15px 0 25px 0' }}>
          Bạn có chắc chắn muốn hủy vĩnh viễn niêm yết này không?
          <br/>
          <strong>Hành động này không thể hoàn tác.</strong>
        </p>

        {error && (
          <div style={errorStyle}>
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