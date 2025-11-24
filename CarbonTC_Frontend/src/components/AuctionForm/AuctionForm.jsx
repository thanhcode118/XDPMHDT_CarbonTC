import React, { useState } from 'react';
import styles from './AuctionForm.module.css';
import { 
  formatCurrency,
} from '../../utils/formatters'; // Điều chỉnh đường dẫn theo project của bạn

const AuctionForm = ({ 
    suggestedPrice, 
    isSuggestionLoading, 
    suggestionType,      
    onSubmit, 
    inventory, 
    isLoadingInventory, 
    inventoryError
  }) => {
  const [formData, setFormData] = useState({
    quantity: '',
    startPrice: '',
    startDate: '',
    endDate: '',
    description: '',
    agreeTerms: false
  });
  
  const [quantityError, setQuantityError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newFormValue
    }));

    if (name === 'quantity') {
      const numValue = parseFloat(newFormValue);
      if (numValue <= 0) {
        setQuantityError('Số lượng phải lớn hơn 0');
      } else if (inventory && numValue > inventory.availableAmount) {
        setQuantityError(`Bạn chỉ có ${formatCurrency(inventory.availableAmount)} tín chỉ khả dụng.`);
      } else {
        setQuantityError(''); 
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      alert('Vui lòng đồng ý với điều khoản và điều kiện');
      return;
    }
    if (quantityError) {
      alert(quantityError);
      return;
    }
    onSubmit(formData);
  };

  const renderSuggestionText = () => {
    if (isSuggestionLoading) {
      return "Đang tải gợi ý giá...";
    }
    if (!suggestedPrice) {
      return 'N/A';
    }
    
    const formattedPrice = formatCurrency(Math.round(suggestedPrice));
    
    if (suggestionType === 'personalized') {
      return (
        <span>Giá gợi ý (cá nhân hóa): <strong>{formattedPrice} VNĐ/tín chỉ</strong></span>
      );
    }
    // Mặc định là 'generic'
    return `Giá thị trường (chung): ${formattedPrice} VNĐ/tín chỉ`;
  };

  const renderInventoryInfo = () => {
    if (isLoadingInventory) {
      return <small className={styles.textSecondary}>Đang kiểm tra tồn kho...</small>;
    }
    if (inventoryError) {
      return <small className={styles.textDanger}>Lỗi: {inventoryError}</small>;
    }
    if (inventory) {
      return (
        <small className={styles.textSuccess}>
          Bạn có <strong>{formatCurrency(inventory.availableAmount)}</strong> tín chỉ khả dụng
        </small>
      );
    }
    return <small className={styles.textSecondary}>Vui lòng chọn nguồn tín chỉ.</small>;
  };

  return (
    <div className={styles.formSection} data-aos="fade-up" data-aos-delay="300">
      <h3 className={styles.formTitle}>Tạo phiên đấu giá mới</h3>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="quantity" className={styles.formLabel}>
              Số lượng tín chỉ
            </label>
            <input
              type="number"
              className={`${styles.formControl} ${quantityError ? styles.isInvalid : ''}`}
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Nhập số lượng tín chỉ"
              required
              min="1"
            />
            {quantityError ? (
              <small className={styles.textDanger}>{quantityError}</small>
            ) : (
              renderInventoryInfo()
            )}
          </div>
          
          <div className="col-md-6">
            <label htmlFor="startPrice" className={styles.formLabel}>
              Tổng giá khởi điểm (VNĐ)
            </label>
            <input
              type="number"
              className={styles.formControl}
              id="startPrice"
              name="startPrice"
              value={formData.startPrice}
              onChange={handleChange}
              placeholder="Nhập giá khởi điểm"
              required
              min="0"
              step="1000"
            />
            <small className={styles.textSecondary}>
              {renderSuggestionText()}
            </small>
          </div>
          
          <div className="col-md-6">
            <label htmlFor="startDate" className={styles.formLabel}>
              Thời gian bắt đầu
            </label>
            <input
              type="datetime-local"
              className={styles.formControl}
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
            <small className={styles.textMuted}>Giờ Việt Nam (UTC+7)</small>
          </div>
          
          <div className="col-md-6">
            <label htmlFor="endDate" className={styles.formLabel}>
              Thời gian kết thúc
            </label>
            <input
              type="datetime-local"
              className={styles.formControl}
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
            <small className={styles.textMuted}>Giờ Việt Nam (UTC+7)</small>
          </div>
          
          <div className="col-12">
            <label htmlFor="description" className={styles.formLabel}>
              Mô tả
            </label>
            <textarea
              className={styles.formControl}
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả cho phiên đấu giá"
            />
          </div>
          
          <div className="col-12">
            <div className={styles.formCheck}>
              <input
                className={styles.formCheckInput}
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
              />
              <label className={styles.formCheckLabel} htmlFor="agreeTerms">
                Tôi đồng ý với các điều khoản và điều kiện tạo phiên đấu giá
              </label>
            </div>
          </div>
          
          <div className="col-12">
            <button 
              type="submit" 
              className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
              disabled={!!quantityError || !formData.agreeTerms || isLoadingInventory}
            >
              Tạo phiên đấu giá
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AuctionForm;