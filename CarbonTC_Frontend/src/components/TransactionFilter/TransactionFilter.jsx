import React, { useEffect, useRef, useState } from 'react';
import styles from './TransactionFilter.module.css';

const TransactionFilter = ({ 
  onFilter,
  onExport,
  activeTab
}) => {
  // 1. Thêm state cho các bộ lọc mới
  const [filters, setFilters] = useState({
    status: '',
    startDate: '', // C# dùng StartDate
    endDate: '',   // C# dùng EndDate
    minAmount: '', // C# dùng MinAmount
    maxAmount: '', // C# dùng MaxAmount
    sortBy: 'CreatedAt', // C# dùng SortBy
    sortDescending: true, // C# dùng SortDescending
    buyerId: '',
    sellerId: '',
    listingId: ''
  });

   const selectRefs = useRef([]);

  useEffect(() => {
    // Force style cho dropdown options
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
      // 2. Map giá trị state sang query params (nếu cần)
      const queryParams = {
        ...filters,
        // Chuyển đổi giá trị rỗng thành null
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

  return (
    <div className={styles.filterSection} data-aos="fade-up">
      <h3 className={styles.filterTitle}>Bộ lọc tìm kiếm</h3>
      <div className="row g-3">
        {/* 3. Xóa bộ lọc "Loại giao dịch" */}

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
            {/* 4. Cập nhật value khớp với Enum C# (Giả định) */}
            <option value="">Tất cả</option>
            <option value="1">Đang xử lý (Pending)</option>
            <option value="2">Hoàn thành (Completed)</option>
            <option value="3">Đã hủy (Cancelled)</option>
            <option value="4">Thất bại (Failed)</option>
          </select>
        </div>
        
        {/* 5. Thêm các bộ lọc mới */}
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
            {/* <button 
              className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
              onClick={onExport}
            >
              Xuất báo cáo
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilter;