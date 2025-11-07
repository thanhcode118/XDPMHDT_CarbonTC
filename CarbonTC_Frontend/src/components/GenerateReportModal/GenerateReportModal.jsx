import React, { useState, useEffect } from 'react';
import styles from './GenerateReportModal.module.css';

const GenerateReportModal = ({ 
  show, 
  onClose, 
  onGenerate 
}) => {
  const [formData, setFormData] = useState({
    reportType: '',
    reportPeriod: '',
    dateFrom: '',
    dateTo: '',
    reportFormat: 'pdf',
    includeCharts: true,
    includeDetails: true,
    emailReport: false,
    emailAddress: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!show) {
      // Reset form when modal closes
      setFormData({
        reportType: '',
        reportPeriod: '',
        dateFrom: '',
        dateTo: '',
        reportFormat: 'pdf',
        includeCharts: true,
        includeDetails: true,
        emailReport: false,
        emailAddress: ''
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

    if (!formData.reportType) {
      newErrors.reportType = 'Vui lòng chọn loại báo cáo';
    }

    if (!formData.reportPeriod) {
      newErrors.reportPeriod = 'Vui lòng chọn kỳ báo cáo';
    }

    if (formData.reportPeriod === 'custom') {
      if (!formData.dateFrom) {
        newErrors.dateFrom = 'Vui lòng chọn ngày bắt đầu';
      }
      if (!formData.dateTo) {
        newErrors.dateTo = 'Vui lòng chọn ngày kết thúc';
      }
      if (formData.dateFrom && formData.dateTo && new Date(formData.dateFrom) > new Date(formData.dateTo)) {
        newErrors.dateTo = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }

    if (formData.emailReport && !formData.emailAddress) {
      newErrors.emailAddress = 'Vui lòng nhập địa chỉ email';
    } else if (formData.emailReport && !/\S+@\S+\.\S+/.test(formData.emailAddress)) {
      newErrors.emailAddress = 'Địa chỉ email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (onGenerate) {
        onGenerate(formData);
      }
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      reportType: '',
      reportPeriod: '',
      dateFrom: '',
      dateTo: '',
      reportFormat: 'pdf',
      includeCharts: true,
      includeDetails: true,
      emailReport: false,
      emailAddress: ''
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
          <h5 className={styles.modalTitle}>Tạo báo cáo</h5>
          <button 
            type="button" 
            className={styles.btnClose}
            onClick={handleClose}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label htmlFor="reportType" className={styles.formLabel}>
                Loại báo cáo
              </label>
              <select 
                className={`${styles.formSelect} ${errors.reportType ? styles.error : ''}`}
                id="reportType" 
                name="reportType"
                value={formData.reportType}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Chọn loại báo cáo</option>
                <option value="summary">Báo cáo tổng hợp</option>
                <option value="transactions">Báo cáo giao dịch</option>
                <option value="trips">Báo cáo hành trình</option>
                <option value="carbon">Báo cáo tín chỉ carbon</option>
                <option value="co2">Báo cáo giảm phát thải CO₂</option>
              </select>
              {errors.reportType && (
                <div className={styles.errorMessage}>{errors.reportType}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="reportPeriod" className={styles.formLabel}>
                Kỳ báo cáo
              </label>
              <select 
                className={`${styles.formSelect} ${errors.reportPeriod ? styles.error : ''}`}
                id="reportPeriod" 
                name="reportPeriod"
                value={formData.reportPeriod}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Chọn kỳ báo cáo</option>
                <option value="week">Tuần</option>
                <option value="month">Tháng</option>
                <option value="quarter">Quý</option>
                <option value="year">Năm</option>
                <option value="custom">Tùy chỉnh</option>
              </select>
              {errors.reportPeriod && (
                <div className={styles.errorMessage}>{errors.reportPeriod}</div>
              )}
            </div>

            {formData.reportPeriod === 'custom' && (
              <div className={`row mb-3 ${styles.customDateRange}`}>
                <div className="col-md-6">
                  <div className={styles.formGroup}>
                    <label htmlFor="dateFrom" className={styles.formLabel}>
                      Từ ngày
                    </label>
                    <input 
                      type="date" 
                      className={`${styles.formControl} ${errors.dateFrom ? styles.error : ''}`}
                      id="dateFrom" 
                      name="dateFrom"
                      value={formData.dateFrom}
                      onChange={handleInputChange}
                    />
                    {errors.dateFrom && (
                      <div className={styles.errorMessage}>{errors.dateFrom}</div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className={styles.formGroup}>
                    <label htmlFor="dateTo" className={styles.formLabel}>
                      Đến ngày
                    </label>
                    <input 
                      type="date" 
                      className={`${styles.formControl} ${errors.dateTo ? styles.error : ''}`}
                      id="dateTo" 
                      name="dateTo"
                      value={formData.dateTo}
                      onChange={handleInputChange}
                    />
                    {errors.dateTo && (
                      <div className={styles.errorMessage}>{errors.dateTo}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="reportFormat" className={styles.formLabel}>
                Định dạng
              </label>
              <select 
                className={styles.formSelect}
                id="reportFormat" 
                name="reportFormat"
                value={formData.reportFormat}
                onChange={handleInputChange}
                required
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.formCheck}>
                <input 
                  className={styles.formCheckInput}
                  type="checkbox" 
                  id="includeCharts" 
                  name="includeCharts"
                  checked={formData.includeCharts}
                  onChange={handleInputChange}
                />
                <label className={styles.formCheckLabel} htmlFor="includeCharts">
                  Bao gồm biểu đồ
                </label>
              </div>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.formCheck}>
                <input 
                  className={styles.formCheckInput}
                  type="checkbox" 
                  id="includeDetails" 
                  name="includeDetails"
                  checked={formData.includeDetails}
                  onChange={handleInputChange}
                />
                <label className={styles.formCheckLabel} htmlFor="includeDetails">
                  Bao gồm chi tiết giao dịch
                </label>
              </div>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.formCheck}>
                <input 
                  className={styles.formCheckInput}
                  type="checkbox" 
                  id="emailReport" 
                  name="emailReport"
                  checked={formData.emailReport}
                  onChange={handleInputChange}
                />
                <label className={styles.formCheckLabel} htmlFor="emailReport">
                  Gửi báo cáo qua email
                </label>
              </div>
            </div>

            {formData.emailReport && (
              <div className={styles.formGroup}>
                <label htmlFor="emailAddress" className={styles.formLabel}>
                  Địa chỉ email
                </label>
                <input 
                  type="email" 
                  className={`${styles.formControl} ${errors.emailAddress ? styles.error : ''}`}
                  id="emailAddress" 
                  name="emailAddress"
                  placeholder="Nhập địa chỉ email"
                  value={formData.emailAddress}
                  onChange={handleInputChange}
                />
                {errors.emailAddress && (
                  <div className={styles.errorMessage}>{errors.emailAddress}</div>
                )}
              </div>
            )}
          </div>
          <div className={styles.modalFooter}>
            <button 
              type="button" 
              className={`${styles.btnCustom} ${styles.btnOutlineCustom}`}
              onClick={handleClose}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
            >
              Tạo báo cáo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateReportModal;