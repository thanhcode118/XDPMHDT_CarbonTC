import React, { useState } from 'react';
import styles from './TransactionFilter.module.css';

const TransactionFilter = ({ 
  onFilter,
  onExport 
}) => {
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApply = () => {
    if (onFilter) {
      onFilter(filters);
    }
  };

  const handleReset = () => {
    const resetFilters = {
      type: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    };
    setFilters(resetFilters);
    if (onFilter) {
      onFilter(resetFilters);
    }
  };

  return (
    <div className={styles.filterSection} data-aos="fade-up">
      <h3 className={styles.filterTitle}>Bộ lọc tìm kiếm</h3>
      <div className="row g-3">
        <div className="col-md-3">
          <label htmlFor="transactionType" className={styles.formLabel}>Loại giao dịch</label>
          <select 
            className={styles.formSelect} 
            id="transactionType"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="sell">Bán tín chỉ</option>
            <option value="buy">Mua tín chỉ</option>
            <option value="auction">Đấu giá</option>
          </select>
        </div>
        <div className="col-md-3">
          <label htmlFor="transactionStatus" className={styles.formLabel}>Trạng thái</label>
          <select 
            className={styles.formSelect} 
            id="transactionStatus"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="completed">Hoàn thành</option>
            <option value="pending">Đang xử lý</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
        <div className="col-md-3">
          <label htmlFor="dateFrom" className={styles.formLabel}>Từ ngày</label>
          <input 
            type="date" 
            className={styles.formControl} 
            id="dateFrom"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="dateTo" className={styles.formLabel}>Đến ngày</label>
          <input 
            type="date" 
            className={styles.formControl} 
            id="dateTo"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          />
        </div>
        <div className="col-12">
          <div className={styles.filterActions}>
            <button 
              className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
              onClick={handleApply}
            >
              Áp dụng bộ lọc
            </button>
            <button 
              className={`${styles.btnCustom} ${styles.btnOutlineCustom}`}
              onClick={handleReset}
            >
              Đặt lại
            </button>
            <button 
              className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
              onClick={onExport}
            >
              Xuất báo cáo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilter;