import React, { useState } from 'react';
import styles from './PDFViewerModal.module.css';

const PDFViewerModal = ({ show, onClose, pdfUrl, title = "Chứng nhận giao dịch" }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!show) return null;

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleClose = () => {
    setIsLoading(true);
    setHasError(false);
    onClose();
  };

  return (
    <div className={`${styles.modal} ${show ? styles.show : ''}`}>
      <div className={styles.modalOverlay} onClick={handleClose}></div>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h5 className={styles.modalTitle}>{title}</h5>
          <button 
            type="button" 
            className={styles.btnClose}
            onClick={handleClose}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
        
        <div className={styles.modalBody}>
          {isLoading && (
            <div className={styles.pdfLoading}>
              <div className={styles.spinner}></div>
              <p>Đang tải chứng nhận...</p>
            </div>
          )}
          
          {hasError && (
            <div className={styles.pdfError}>
              <i className="bi bi-exclamation-triangle"></i>
              <p>Không thể tải chứng nhận. Vui lòng thử lại.</p>
              <button 
                className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
                onClick={() => window.open(pdfUrl, '_blank')}
              >
                Mở trong tab mới
              </button>
            </div>
          )}
          
          <div className={styles.pdfContainer} style={{ display: hasError ? 'none' : 'block' }}>
            <iframe
              src={`${pdfUrl}#view=FitH`}
              title={title}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button 
            type="button" 
            className={`${styles.btnCustom} ${styles.btnOutlineCustom}`}
            onClick={handleClose}
          >
            <i className="bi bi-x-circle"></i>
            Đóng
          </button>
          <button 
            type="button" 
            className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
            onClick={() => window.open(pdfUrl, '_blank')}
          >
            <i className="bi bi-box-arrow-up-right"></i>
            Mở trong tab mới
          </button>
          <a 
            href={pdfUrl}
            download={`${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().getTime()}.pdf`}
            className={`${styles.btnCustom} ${styles.btnSuccessCustom}`}
          >
            <i className="bi bi-download"></i>
            Tải xuống
          </a>
        </div>
      </div>
    </div>
  );
};

export default PDFViewerModal;