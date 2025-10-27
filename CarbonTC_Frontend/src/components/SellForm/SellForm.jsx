import React, { useEffect, useState } from 'react';
import styles from './SellForm.module.css';

const SellForm = ({ suggestedPrice, onSubmit, inventory, isLoadingInventory, inventoryError }) => {
  const [formData, setFormData] = useState({
    quantity: '',
    price: suggestedPrice || '',
    description: '',
    agreeTerms: false
  });

  const [quantityError, setQuantityError] = useState('');

  useEffect(() => {
    if (suggestedPrice) {
      setFormData(prev => ({ ...prev, price: Math.round(suggestedPrice) }));
    }
  }, [suggestedPrice]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newFormValue
    }));

    // --- (3. LOGIC VALIDATE SỐ LƯỢNG) ---
    if (name === 'quantity') {
      const numValue = parseFloat(newFormValue);
      if (numValue <= 0) {
        setQuantityError('Số lượng phải lớn hơn 0');
      } else if (inventory && numValue > inventory.availableAmount) {
        setQuantityError(`Bạn chỉ có ${inventory.availableAmount} tín chỉ khả dụng.`);
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
          Bạn có <strong>{inventory.availableAmount}</strong> tín chỉ khả dụng
        </small>
      );
    }
    return <small className={styles.textSecondary}>Vui lòng chọn nguồn tín chỉ.</small>;
  };

  return (
    <div className={styles.formSection} data-aos="fade-up">
      <h3 className={styles.formTitle}>Niêm yết tín chỉ để bán</h3>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="quantity" className={styles.formLabel}>
              Số lượng tín chỉ
            </label>
            <input
              type="number"
              className={styles.formControl}
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Nhập số lượng tín chỉ"
              required
            />
            {quantityError ? (
              <small className={styles.textDanger}>{quantityError}</small>
            ) : (
              renderInventoryInfo()
            )}
          </div>
          
          <div className="col-md-6">
            <label htmlFor="price" className={styles.formLabel}>Giá mỗi tín chỉ (VNĐ)</label>
            <input
              type="number"
              className={styles.formControl}
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Nhập giá mỗi tín chỉ"
              required
            />
            <small className={styles.textSecondary}>
              Giá thị trường đề xuất: {suggestedPrice ? `${Math.round(suggestedPrice).toLocaleString()} VNĐ/tín chỉ` : 'N/A'}
            </small>
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
              placeholder="Nhập mô tả cho tín chỉ của bạn"
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
                Tôi đồng ý với các điều khoản và điều kiện niêm yết tín chỉ
              </label>
            </div>
          </div>
          
          <div className="col-12">
            <button 
              type="submit" 
              className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
              disabled={!!quantityError || !formData.agreeTerms || isLoadingInventory}
            >
              Niêm yết tín chỉ
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SellForm;