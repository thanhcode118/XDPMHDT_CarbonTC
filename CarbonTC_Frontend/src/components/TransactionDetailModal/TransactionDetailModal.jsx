import React, { useState, useEffect } from 'react';
import styles from './TransactionDetailModal.module.css';
import { submitDispute, getDisputeByTransactionId } from '../../services/listingService.jsx'; 

const TransactionDetailModal = ({ 
  show, 
  onClose, 
  transaction,
  onDownloadCertificate,
  isDownloading
}) => {
  const [view, setView] = useState('details'); // 'details' or 'dispute'
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
  const [disputeError, setDisputeError] = useState('');
  const [disputeSuccess, setDisputeSuccess] = useState('');
  const [hasExistingDispute, setHasExistingDispute] = useState(false);
  const [isCheckingDispute, setIsCheckingDispute] = useState(false);

  // --- Định nghĩa các lựa chọn khiếu nại ---
  const disputeOptions = [
    { 
      group: "1. Vấn đề về sản phẩm", 
      options: [
        "Carbon credits không đúng như mô tả",
        "Số lượng carbon credits nhận được không khớp với đơn hàng",
        "Chất lượng carbon credits không đạt tiêu chuẩn CVA đã công bố",
        "Carbon credits đã bị retire trước khi giao dịch"
      ]
    },
    { 
      group: "2. Vấn đề về giao dịch", 
      options: [
        "Không nhận được carbon credits sau khi thanh toán",
        "Bị trừ tiền nhiều lần cho cùng một giao dịch",
        "Giá thực tế cao hơn giá niêm yết",
        "Giao dịch bị hủy nhưng chưa được hoàn tiền"
      ]
    },
    { 
      group: "3. Vấn đề về người bán", 
      options: [
        "Người bán không phản hồi sau giao dịch",
        "Người bán cung cấp thông tin sai lệch về carbon credits",
        "Người bán vi phạm điều khoản dịch vụ"
      ]
    },
    { 
      group: "4. Vấn đề kỹ thuật", 
      options: [
        "Lỗi hệ thống dẫn đến giao dịch không thành công",
        "Certificate không được tạo sau khi mua",
        "Carbon wallet không cập nhật sau giao dịch"
      ]
    },
    { 
      group: "5. Vấn đề gian lận", 
      options: [
        "Nghi ngờ carbon credits giả mạo",
        "Phát hiện giao dịch trùng lặp không hợp lệ",
        "Người bán sử dụng thông tin gian lận"
      ]
    }
  ];

  // --- Hàm kiểm tra khiếu nại hiện có ---
  const checkExistingDispute = async (transactionId) => {
    if (!transactionId) return false;
    
    setIsCheckingDispute(true);
    try {
      const response = await getDisputeByTransactionId(transactionId);
      
      // Kiểm tra nếu có dữ liệu trong mảng data
      if (response.data && response.data.data && response.data.data.length > 0) {
        setHasExistingDispute(true);
        return true;
      } else {
        setHasExistingDispute(false);
        return false;
      }
    } catch (error) {
      console.error('Error checking existing dispute:', error);
      // Trong trường hợp lỗi, giả sử không có khiếu nại để người dùng có thể thử tạo
      setHasExistingDispute(false);
      return false;
    } finally {
      setIsCheckingDispute(false);
    }
  };

  // --- Effect để kiểm tra khiếu nại khi modal hiển thị ---
  useEffect(() => {
    if (show && transaction) {
      checkExistingDispute(transaction.id);
    }
  }, [show, transaction]);

  // --- Effect để kiểm tra lại khi chuyển sang view dispute ---
  useEffect(() => {
    if (view === 'dispute' && transaction) {
      checkExistingDispute(transaction.id);
    }
  }, [view, transaction]);

  if (!show || !transaction) return null;

  const {
    id,
    type,
    status,
    quantity,
    price,
    totalValue,
    fee,
    date,
    seller,
    buyer,
    timeline = []
  } = transaction;

  const detailItems = [
    { label: 'Mã giao dịch', value: `#${id}` },
    { label: 'Loại giao dịch', value: type === 'sell' ? 'Bán tín chỉ' : 'Mua tín chỉ' },
    { label: 'Ngày giao dịch', value: date },
    { 
      label: 'Trạng thái', 
      value: (
        <span className={`${styles.transactionStatus} ${styles[status]}`}>
          {status === 'completed' ? 'Hoàn thành' : 
           status === 'pending' ? 'Đang xử lý' : 'Đã hủy'}
        </span>
      ) 
    },
    { label: 'Số lượng tín chỉ', value: quantity },
    { label: 'Giá/tín chỉ', value: `${price.toLocaleString()} VNĐ` },
    { label: 'Tổng giá trị', value: `${totalValue.toLocaleString()} VNĐ` },
    { label: 'Phí giao dịch', value: `${fee.amount.toLocaleString()} VNĐ (${fee.percentage}%)` }
  ];

  const defaultTimeline = [
    { date: `${date} 09:30`, action: 'Tạo yêu cầu giao dịch', completed: true },
    { date: `${date} 10:15`, action: 'Người mua xác nhận', completed: true },
    { date: `${date} 11:45`, action: 'Thanh toán thành công', completed: true },
    { date: `${date} 12:00`, action: 'Giao dịch hoàn thành', completed: true }
  ];

  const displayTimeline = timeline.length > 0 ? timeline : defaultTimeline;

  // Hàm đóng modal (reset state)
  const handleClose = () => {
    setView('details');
    setDisputeReason('');
    setDisputeDescription('');
    setIsSubmittingDispute(false);
    setDisputeError('');
    setDisputeSuccess('');
    setHasExistingDispute(false);
    onClose();
  };

  // Hàm xử lý khi nhấn nút Khiếu nại
  const handleDisputeButtonClick = async () => {
    // Kiểm tra lại trước khi chuyển sang view dispute
    const hasDispute = await checkExistingDispute(transaction.id);
    
    if (hasDispute) {
      setDisputeError('Giao dịch này đã có khiếu nại. Vui lòng chờ kết quả xử lý.');
      return;
    }
    
    setView('dispute');
  };

  // Hàm gửi khiếu nại
  const handleDisputeSubmit = async () => {
    // Kiểm tra validation
    if (!disputeReason || disputeReason === "") {
      setDisputeError('Vui lòng chọn một lý do khiếu nại từ danh sách.');
      return;
    }
    if (!disputeDescription) {
      setDisputeError('Vui lòng nhập mô tả chi tiết để làm rõ lý do của bạn.');
      return;
    }
    
    // Kiểm tra lại xem có khiếu nại nào mới được tạo không
    const hasDispute = await checkExistingDispute(transaction.id);
    if (hasDispute) {
      setDisputeError('Giao dịch này đã có khiếu nại. Không thể gửi khiếu nại mới.');
      return;
    }

    setIsSubmittingDispute(true);
    setDisputeError('');
    setDisputeSuccess('');

    try {
      const payload = {
        transactionId: id, 
        reason: disputeReason,
        description: disputeDescription
      };
      
      await submitDispute(payload); 
      
      setDisputeSuccess('Gửi khiếu nại thành công! Vui lòng chờ xử lý.');
      setIsSubmittingDispute(false);
      
      // Reset form và quay lại màn hình chi tiết sau 2 giây
      setTimeout(() => {
        setDisputeReason('');
        setDisputeDescription('');
        setView('details');
        setDisputeSuccess('');
        setHasExistingDispute(true); // Đánh dấu đã có khiếu nại
      }, 2000);

    } catch (error) {
      console.error('Error submitting dispute:', error);
      setDisputeError(error.response?.data?.message || 'Gửi khiếu nại thất bại. Vui lòng thử lại.');
      setIsSubmittingDispute(false);
    }
  };

  return (
    <div className={`${styles.modal} ${show ? styles.show : ''}`}>
      <div className={styles.modalOverlay} onClick={handleClose}></div>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h5 className={styles.modalTitle}>
            {view === 'details' ? 'Chi tiết giao dịch' : 'Báo cáo khiếu nại'}
          </h5>
          <button 
            type="button" 
            className={styles.btnClose}
            onClick={handleClose}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
        
        <div className={styles.modalBody}>
          {view === 'details' ? (
            <>
              {/* --- Phần Chi Tiết Giao Dịch --- */}
              <div className={styles.transactionDetailInfo}>
                {detailItems.map((item, index) => (
                  <div key={index} className={styles.detailItem}>
                    <div className={styles.detailLabel}>{item.label}</div>
                    <div className={styles.detailValue}>{item.value}</div>
                  </div>
                ))}
              </div>
              
              {/* Hiển thị thông báo nếu đã có khiếu nại */}
              {hasExistingDispute && (
                <div className="alert alert-warning text-center p-4 mb-4 border-3 shadow" role="alert" 
                    style={{ 
                      backgroundColor: '#fffbf0', 
                      borderColor: '#ffc107',
                      fontSize: '1.05rem',
                      fontWeight: '500'
                    }}>
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="bi bi-exclamation-triangle-fill me-3 fs-5" style={{ color: '#ffc107' }}></i>
                    <span>
                      <strong>Thông báo quan trọng:</strong> Giao dịch này đã có khiếu nại đang được xử lý.
                    </span>
                  </div>
                </div>
              )}
              
              <div className="row">
                <div className="col-md-6">
                  <h6 className={styles.sectionTitle}>Người bán</h6>
                  <div className={styles.partyInfo}>
                    <img src={seller.avatar} alt="Seller" className={styles.partyAvatar} />
                    <div>
                      <div className={styles.partyName}>{seller.name}</div>
                      <div className={styles.partyRole}>{seller.role}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <h6 className={styles.sectionTitle}>Người mua</h6>
                  <div className={styles.partyInfo}>
                    <img src={buyer.avatar} alt="Buyer" className={styles.partyAvatar} />
                    <div>
                      <div className={styles.partyName}>{buyer.name}</div>
                      <div className={styles.partyRole}>{buyer.role}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.timelineSection}>
                <h6 className={styles.sectionTitle}>Lịch sử giao dịch</h6>
                <div className={styles.timeline}>
                  {displayTimeline.map((item, index) => (
                    <div key={index} className={styles.timelineItem}>
                      <div className={styles.timelineIcon}>
                        <div className={`${styles.timelineDot} ${item.completed ? styles.completed : styles.pending}`}>
                          <i className={`bi bi-${item.completed ? 'check' : 'clock'}`}></i>
                        </div>
                        {index < displayTimeline.length - 1 && (
                          <div className={styles.timelineLine}></div>
                        )}
                      </div>
                      <div className={styles.timelineContent}>
                        <div className={styles.timelineDate}>{item.date}</div>
                        <div className={styles.timelineAction}>{item.action}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* --- Phần Form Khiếu Nại --- */}
              <div className={styles.disputeForm}>
                <p>Bạn đang tạo khiếu nại cho giao dịch <strong>#{id}</strong>.</p>
                
                {/* Hiển thị thông báo nếu đang kiểm tra */}
                {isCheckingDispute && (
                  <div className={styles.alertInfo}>
                    <span className="spinner-border spinner-border-sm" role="status" style={{marginRight: '8px'}}></span>
                    Đang kiểm tra khiếu nại...
                  </div>
                )}
                
                {/* Hiển thị thông báo nếu đã có khiếu nại */}
                {hasExistingDispute && (
                  <div className={styles.alertWarning}>
                    <i className="bi bi-exclamation-triangle" style={{marginRight: '8px'}}></i>
                    Giao dịch này đã có khiếu nại. Không thể tạo khiếu nại mới.
                  </div>
                )}

                {disputeError && <div className={styles.alertError}>{disputeError}</div>}
                {disputeSuccess && <div className={styles.alertSuccess}>{disputeSuccess}</div>}

                <div className={styles.formGroup}>
                  <label htmlFor="disputeReason">Lý do khiếu nại</label>
                  <select
                    id="disputeReason"
                    className={styles.formControl}
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    disabled={isSubmittingDispute || hasExistingDispute}
                  >
                    <option value="" disabled>-- Vui lòng chọn một lý do --</option>
                    
                    {disputeOptions.map((group) => (
                      <optgroup label={group.group} key={group.group}>
                        {group.options.map((option) => (
                          <option value={option} key={option}>
                            {option}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    
                    <option value="Khác">Khác (Vui lòng mô tả ở bên dưới)</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="disputeDescription">Mô tả chi tiết</label>
                  <textarea
                    id="disputeDescription"
                    className={styles.formControl}
                    rows="5"
                    value={disputeDescription}
                    onChange={(e) => setDisputeDescription(e.target.value)}
                    placeholder="Vui lòng mô tả rõ vấn đề bạn gặp phải..."
                    disabled={isSubmittingDispute || hasExistingDispute}
                  ></textarea>
                </div>
              </div>
            </>
          )}
        </div>

        <div className={styles.modalFooter}>
          {view === 'details' ? (
            <>
              {/* --- Footer Chi Tiết --- */}
              <button 
                type="button" 
                className={`${styles.btnCustom} ${styles.btnOutlineCustom}`}
                onClick={handleClose}
                disabled={isDownloading}
              >
                Đóng
              </button>
              
              {/* Nút Khiếu Nại - bị vô hiệu hóa nếu đã có khiếu nại */}
              <button 
                type="button" 
                className={`${styles.btnCustom} ${styles.btnDangerCustom}`}
                onClick={handleDisputeButtonClick}
                disabled={isDownloading || hasExistingDispute || isCheckingDispute}
              >
                {isCheckingDispute ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" style={{marginRight: '8px'}}></span>
                    Đang kiểm tra...
                  </>
                ) : hasExistingDispute ? (
                  'Đã có khiếu nại'
                ) : (
                  'Khiếu nại'
                )}
              </button>

              <button 
                type="button" 
                className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
                onClick={onDownloadCertificate}
                disabled={isDownloading}
              >
                {isDownloading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ marginRight: '8px' }}></span>
                  Đang tải...
                </>
                ) : (
                  'Tải chứng nhận'
                )}
              </button>
            </>
          ) : (
            <>
              {/* --- Footer Khiếu Nại --- */}
              <button 
                type="button" 
                className={`${styles.btnCustom} ${styles.btnOutlineCustom}`}
                onClick={() => setView('details')}
                disabled={isSubmittingDispute}
              >
                Quay lại
              </button>
              <button 
                type="button" 
                className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
                onClick={handleDisputeSubmit}
                disabled={isSubmittingDispute || hasExistingDispute}
              >
                {isSubmittingDispute ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ marginRight: '8px' }}></span>
                    Đang gửi...
                  </>
                ) : hasExistingDispute ? (
                  'Đã có khiếu nại'
                ) : (
                  'Gửi khiếu nại'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;