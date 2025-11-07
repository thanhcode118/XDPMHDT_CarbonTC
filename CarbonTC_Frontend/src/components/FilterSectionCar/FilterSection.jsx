import React, { useState } from 'react';
import styles from './FilterSection.module.css';

const FilterSection = ({ 
  title = "Bộ lọc tìm kiếm",
  onFilter,
  vehicles = [] 
}) => {
  const [filters, setFilters] = useState({
    vehicle: '',
    dateFrom: '',
    dateTo: ''
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  const handleApply = () => {
    if (onFilter) {
      onFilter(filters);
    }
  };

  return (
    <div className={styles.filterSection} data-aos="fade-up">
      <h3 className={styles.filterTitle}>{title}</h3>
      <div className="row g-3">
        <div className="col-md-3">
          <label htmlFor="vehicleFilter" className={styles.formLabel}>Xe điện</label>
          <select 
            className={styles.formSelect} 
            id="vehicleFilter"
            value={filters.vehicle}
            onChange={(e) => handleFilterChange('vehicle', e.target.value)}
          >
            <option value="">Tất cả</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label htmlFor="dateFromFilter" className={styles.formLabel}>Từ ngày</label>
          <input 
            type="date" 
            className={styles.formControl} 
            id="dateFromFilter"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="dateToFilter" className={styles.formLabel}>Đến ngày</label>
          <input 
            type="date" 
            className={styles.formControl} 
            id="dateToFilter"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          />
        </div>
        <div className="col-md-3 d-flex align-items-end">
          <button 
            className={`${styles.btnCustom} ${styles.btnPrimaryCustom} w-100`}
            onClick={handleApply}
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;