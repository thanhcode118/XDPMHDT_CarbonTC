import React, { useState, useRef } from 'react';
import styles from './UploadJourneyModal.module.css';
import Button from '../Button/Button';
// --- Import service ---
import { uploadJourneyFile } from '../../services/tripService';
// --- Import hook thông báo ---
import { useNotification } from '../../hooks/useNotification'; // Đảm bảo đường dẫn đúng

// --- Thêm props: onUploadSuccess ---
const UploadJourneyModal = ({ show, onClose, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  // --- State cho trạng thái loading ---
  const [isUploading, setIsUploading] = useState(false);
  // --- Lấy hàm showNotification ---
  const { showNotification } = useNotification();

  const handleFileChange = (e) => {
    // ... (code xử lý file change giữ nguyên) ...
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/json' || file.type === 'text/csv' || file.name.endsWith('.csv') || file.name.endsWith('.json')) {
        setSelectedFile(file);
        setError('');
      } else {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setError('Định dạng file không hợp lệ. Vui lòng chọn file .json hoặc .csv.');
      }
    } else {
      setSelectedFile(null);
      setError('');
    }
  };

  const handleChooseFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // --- Cập nhật handleSubmit để gọi API ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Vui lòng chọn một file để tải lên.');
      return;
    }

    setIsUploading(true); // Bắt đầu tải lên
    setError('');

    try {
      // Gọi API service
      const result = await uploadJourneyFile(selectedFile);

      showNotification(`Tải lên thành công! ${result.successfulRecords}/${result.totalRecords} hành trình được xử lý.`, 'success');
       if (result.failedRecords > 0) {
           console.warn("Lỗi xử lý file:", result.errors);
           // Có thể hiển thị chi tiết lỗi nếu cần
           showNotification(`Có ${result.failedRecords} lỗi trong quá trình xử lý file. Chi tiết xem ở console.`, 'warning');
       }

      // Gọi callback báo thành công cho component cha
      if (onUploadSuccess) {
        onUploadSuccess();
        console.log("UploadJourneyModal: onUploadSuccess called!"); 
      }
      handleClose(); // Đóng modal sau khi thành công

    } catch (apiError) {
      // Lỗi từ interceptor (đã chứa message)
      showNotification(apiError.message, 'error');
      setError(apiError.message); // Hiển thị lỗi dưới input nếu muốn
    } finally {
      setIsUploading(false); // Kết thúc tải lên (dù thành công hay lỗi)
    }
  };


  const handleClose = () => {
    // ... (code reset state giữ nguyên) ...
     setSelectedFile(null);
     setError('');
     if (fileInputRef.current) {
         fileInputRef.current.value = "";
     }
     setIsUploading(false); // Đảm bảo reset trạng thái loading khi đóng
     onClose();
  };

  if (!show) return null;

  return (
    <div className={`${styles.modal} ${show ? styles.show : ''}`}>
      <div className={styles.modalOverlay} onClick={handleClose}></div>
      <div className={styles.modalContent}>
        {/* Header giữ nguyên */}
        <div className={styles.modalHeader}>
           <h5 className={styles.modalTitle}>Tải lên Dữ liệu Hành trình</h5>
           <button type="button" className={styles.btnClose} onClick={handleClose} disabled={isUploading}>
             <i className="bi bi-x"></i>
           </button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Body giữ nguyên, chỉ thêm disabled khi đang upload */}
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Chọn file hành trình (.json, .csv)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                className={styles.hiddenFileInput}
                id="journeyFile"
                name="journeyFile"
                accept=".json, .csv, application/json, text/csv"
                onChange={handleFileChange}
                disabled={isUploading} // Disable khi đang tải
              />
              <div className={styles.fileInputContainer}>
                 <Button
                    type="button"
                    variant="outline"
                    onClick={handleChooseFileClick}
                    className={error ? styles.errorButton : ''}
                    disabled={isUploading} // Disable khi đang tải
                 >
                    <i className="bi bi-folder2-open me-2"></i> Chọn File
                 </Button>
                 <span className={styles.fileNameDisplay}>
                    {selectedFile ? selectedFile.name : "Chưa có file nào được chọn"}
                 </span>
              </div>
              {error && (
                <div className={styles.errorMessage}>{error}</div>
              )}
            </div>
            <p className={styles.helperText}>
              Hệ thống sẽ tự động xử lý dữ liệu từ file bạn tải lên để tạo các chuyến đi.
            </p>
          </div>
          {/* Footer cập nhật nút Tải lên */}
          <div className={styles.modalFooter}>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isUploading}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" disabled={!selectedFile || isUploading}>
              {isUploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang tải lên...
                </>
              ) : (
                'Tải lên'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadJourneyModal;