import React, { useEffect, useRef, useState } from 'react';
import styles from './TransactionFilter.module.css';

const TransactionFilter = ({ 
  onFilter,
  onExport,
  activeTab
}) => {
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'CreatedAt',
    sortDescending: true,
    buyerId: '',
    sellerId: '',
    listingId: ''
  });

  const selectRefs = useRef([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportRange, setExportRange] = useState('month');

  useEffect(() => {
    selectRefs.current.forEach(select => {
      if (select) {
        select.style.backgroundColor = 'var(--card-bg)';
        select.style.color = 'var(--text-primary)';
      }
    });
  }, []);

  const addToRefs = (el) => {
    if (el && !selectRefs.current.includes(el)) {
      selectRefs.current.push(el);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApply = () => {
    if (onFilter) {
      const queryParams = {
        ...filters,
        status: filters.status ? parseInt(filters.status) : null,
        minAmount: filters.minAmount ? parseFloat(filters.minAmount) : null,
        maxAmount: filters.maxAmount ? parseFloat(filters.maxAmount) : null,
        startDate: filters.startDate || null,
        endDate: filters.endDate || null,
        sortDescending: filters.sortDescending === 'true',
        buyerId: filters.buyerId.trim() || null,
        sellerId: filters.sellerId.trim() || null,
        listingId: filters.listingId.trim() || null,
      };
      onFilter(queryParams);
    }
  };

  const handleReset = () => {
    const resetFilters = {
      status: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      sortBy: 'CreatedAt',
      sortDescending: true,
      buyerId: '',
      sellerId: '',
      listingId: '',
      pageNumber: 1
    };
    setFilters(resetFilters);
    if (onFilter) {
      onFilter(resetFilters);
    }
  };

  const openModal = () => setShowExportModal(true);
  const closeModal = () => setShowExportModal(false);

  const handleConfirmExport = () => {
    if (onExport) {
      onExport(exportRange); 
    }
    closeModal();
  };

  return (
    <div className={styles.filterSection} data-aos="fade-up">
      <h3 className={styles.filterTitle}>Bộ lọc tìm kiếm</h3>
      <div className="row g-3">
        {/* Trạng thái */}
        <div className="col-md-3">
          <label htmlFor="transactionStatus" className={styles.formLabel}>Trạng thái</label>
          <select 
            ref={addToRefs}
            className={styles.formSelect} 
            id="transactionStatus"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="1">Đang xử lý (Pending)</option>
            <option value="2">Hoàn thành (Completed)</option>
            <option value="3">Đã hủy (Cancelled)</option>
            <option value="4">Thất bại (Failed)</option>
          </select>
        </div>
        
        {/* Các bộ lọc khác */}
        <div className="col-md-3">
          <label htmlFor="minAmount" className={styles.formLabel}>Giá trị từ (VNĐ)</label>
          <input 
            type="number" 
            className={styles.formControl} 
            id="minAmount"
            value={filters.minAmount}
            onChange={(e) => handleFilterChange('minAmount', e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="maxAmount" className={styles.formLabel}>Giá trị đến (VNĐ)</label>
          <input 
            type="number" 
            className={styles.formControl} 
            id="maxAmount"
            value={filters.maxAmount}
            onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="sortBy" className={styles.formLabel}>Sắp xếp theo</label>
          <select 
            className={styles.formSelect} 
            id="sortBy"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="CreatedAt">Ngày tạo</option>
            <option value="TotalAmount">Tổng giá trị</option>
            <option value="CompletedAt">Ngày hoàn thành</option>
            <option value="Quantity">Số lượng</option>
          </select>
        </div>

        {/* Ngày tháng */}
        <div className="col-md-3">
          <label htmlFor="startDate" className={styles.formLabel}>Từ ngày</label>
          <input 
            type="date" 
            className={styles.formControl} 
            id="startDate"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="endDate" className={styles.formLabel}>Đến ngày</label>
          <input 
            type="date" 
            className={styles.formControl} 
            id="endDate"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
          />
        </div>
        {activeTab === 'sales' && (
          <div className="col-md-3">
            <label htmlFor="buyerId" className={styles.formLabel}>ID Người mua (BuyerId)</label>
            <input 
              type="text" 
              className={styles.formControl} 
              id="buyerId"
              value={filters.buyerId}
              onChange={(e) => handleFilterChange('buyerId', e.target.value)}
              placeholder="Nhập GUID người mua..."
            />
          </div>
        )}
        {activeTab === 'purchases' && (
          <div className="col-md-3">
            <label htmlFor="sellerId" className={styles.formLabel}>ID Người bán (SellerId)</label>
            <input 
              type="text" 
              className={styles.formControl} 
              id="sellerId"
              value={filters.sellerId}
              onChange={(e) => handleFilterChange('sellerId', e.target.value)}
              placeholder="Nhập GUID người bán..."
            />
          </div>
        )}
        <div className="col-md-3">
          <label htmlFor="listingId" className={styles.formLabel}>ID Niêm yết (ListingId)</label>
          <input 
            type="text" 
            className={styles.formControl} 
            id="listingId"
            value={filters.listingId}
            onChange={(e) => handleFilterChange('listingId', e.target.value)}
            placeholder="Nhập GUID niêm yết..."
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
              className={`${styles.btnCustom} ${styles.btnSuccessCustom}`}
              onClick={openModal}
            >
              <i className="bi bi-file-earmark-excel me-2"></i>
              Xuất báo cáo
            </button>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className={styles.modal}>
          <div className={styles.modalOverlay} onClick={closeModal}></div>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h5 className={styles.modalTitle}>Chọn kỳ báo cáo</h5>
              <button 
                type="button" 
                className={styles.btnClose}
                onClick={closeModal}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalDescription}>
                Bạn muốn xuất sao kê giao dịch trong khoảng thời gian nào?
              </p>
              
              <div className={styles.radioGroup}>
                <div className={styles.radioItem}>
                  <input 
                    className={styles.radioInput}
                    type="radio" 
                    name="exportRange" 
                    id="rangeWeek" 
                    value="week" 
                    checked={exportRange === 'week'} 
                    onChange={(e) => setExportRange(e.target.value)}
                  />
                  <label className={styles.radioLabel} htmlFor="rangeWeek">
                    1 Tuần gần nhất
                  </label>
                </div>

                <div className={styles.radioItem}>
                  <input 
                    className={styles.radioInput}
                    type="radio" 
                    name="exportRange" 
                    id="rangeMonth" 
                    value="month" 
                    checked={exportRange === 'month'} 
                    onChange={(e) => setExportRange(e.target.value)}
                  />
                  <label className={styles.radioLabel} htmlFor="rangeMonth">
                    1 Tháng gần nhất
                  </label>
                </div>

                <div className={styles.radioItem}>
                  <input 
                    className={styles.radioInput}
                    type="radio" 
                    name="exportRange" 
                    id="rangeYear" 
                    value="year" 
                    checked={exportRange === 'year'} 
                    onChange={(e) => setExportRange(e.target.value)}
                  />
                  <label className={styles.radioLabel} htmlFor="rangeYear">
                    1 Năm gần nhất
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button 
                type="button" 
                className={`${styles.btnCustom} ${styles.btnOutlineCustom}`}
                onClick={closeModal}
              >
                Hủy
              </button>
              <button 
                type="button" 
                className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
                onClick={handleConfirmExport}
              >
                <i className="bi bi-download me-2"></i> 
                Xác nhận xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionFilter;