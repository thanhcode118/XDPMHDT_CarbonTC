import React, { useState } from 'react';
import styles from './AddVehicleModal.module.css';

const AddVehicleModal = ({ show, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    color: '',
    mileage: '',
    licensePlate: '',
    image: null,
    syncData: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      brand: '',
      model: '',
      year: '',
      color: '',
      mileage: '',
      licensePlate: '',
      image: null,
      syncData: true
    });
    onClose();
  };

  if (!show) return null;

  return (
    <div className={`${styles.modal} ${show ? styles.show : ''}`}>
      <div className={styles.modalOverlay} onClick={handleClose}></div>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h5 className={styles.modalTitle}>Thêm xe điện mới</h5>
          <button 
            type="button" 
            className={styles.btnClose}
            onClick={handleClose}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
        <div className={styles.modalBody}>
          <form id="addVehicleForm" onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="vehicleBrand" className={styles.formLabel}>Hãng xe</label>
                <select 
                  className={styles.formSelect} 
                  id="vehicleBrand" 
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>Chọn hãng xe</option>
                  <option value="vinfast">VinFast</option>
                  <option value="tesla">Tesla</option>
                  <option value="hyundai">Hyundai</option>
                  <option value="kia">KIA</option>
                  <option value="mg">MG</option>
                  <option value="nissan">Nissan</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div className="col-md-6">
                <label htmlFor="vehicleModel" className={styles.formLabel}>Dòng xe</label>
                <input 
                  type="text" 
                  className={styles.formControl} 
                  id="vehicleModel" 
                  name="model"
                  placeholder="Nhập dòng xe" 
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="vehicleYear" className={styles.formLabel}>Năm sản xuất</label>
                <input 
                  type="number" 
                  className={styles.formControl} 
                  id="vehicleYear" 
                  name="year"
                  placeholder="Nhập năm sản xuất" 
                  min="2000" 
                  max="2023" 
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="vehicleColor" className={styles.formLabel}>Màu sắc</label>
                <input 
                  type="text" 
                  className={styles.formControl} 
                  id="vehicleColor" 
                  name="color"
                  placeholder="Nhập màu sắc" 
                  value={formData.color}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="vehicleMileage" className={styles.formLabel}>Số km đã đi</label>
                <input 
                  type="number" 
                  className={styles.formControl} 
                  id="vehicleMileage" 
                  name="mileage"
                  placeholder="Nhập số km đã đi" 
                  min="0" 
                  value={formData.mileage}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="vehicleLicensePlate" className={styles.formLabel}>Biển số xe</label>
                <input 
                  type="text" 
                  className={styles.formControl} 
                  id="vehicleLicensePlate" 
                  name="licensePlate"
                  placeholder="Nhập biển số xe" 
                  value={formData.licensePlate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-12">
                <label htmlFor="vehicleImage" className={styles.formLabel}>Hình ảnh xe (tùy chọn)</label>
                <input 
                  type="file" 
                  className={styles.formControl} 
                  id="vehicleImage" 
                  name="image"
                  accept="image/*"
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-12">
                <div className={styles.formCheck}>
                  <input 
                    className={styles.formCheckInput} 
                    type="checkbox" 
                    id="syncData" 
                    name="syncData"
                    checked={formData.syncData}
                    onChange={handleInputChange}
                  />
                  <label className={styles.formCheckLabel} htmlFor="syncData">
                    Tự động đồng bộ dữ liệu hành trình
                  </label>
                </div>
              </div>
            </div>
          </form>
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
            type="button" 
            className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
            onClick={handleSubmit}
          >
            Lưu xe điện
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddVehicleModal;