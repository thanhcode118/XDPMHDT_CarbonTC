import React, { useState, useEffect } from 'react';
import styles from '../../pages/Marketplace/Marketplace.module.css'; 

const formatDateTimeLocal = (isoString) => {
    if (!isoString) return '';
    
    try {
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
        console.error("Lỗi định dạng ngày:", isoString, error);
        return '';
    }
};

const EditListingModal = ({ 
    isOpen, onClose, onSubmit, 
    listingData, isLoading, error,
    suggestedPrice, 
    isSuggestionLoading 
}) => {
    const [formData, setFormData] = useState({
        type: 1,
        status: 1,
        pricePerUnit: 0,
        minimumBid: 0,
        auctionEndTime: '',
        closedAt: ''
    });
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        if (listingData) {
            setFormData({
                type: listingData.type || 1,
                status: listingData.status || 1,
                pricePerUnit: listingData.pricePerUnit || 0,
                minimumBid: listingData.minimumBid || 0,
                auctionEndTime: formatDateTimeLocal(listingData.auctionEndTime),
                closedAt: formatDateTimeLocal(listingData.closedAt)
            });
        }
    }, [listingData]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        
        setValidationError(''); 
        
        if (type === 'number') {
            setFormData(prev => ({ 
                ...prev, 
                [name]: value === '' ? 0 : Number(value) 
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.type == 2 && (!formData.pricePerUnit || formData.pricePerUnit <= 0)) {
            setValidationError('Giá/tín chỉ phải lớn hơn 0 khi loại niêm yết là Đấu giá');
            return;
        }

        const payload = {
            type: Number(formData.type),
            status: Number(formData.status),
            pricePerUnit: Number(formData.pricePerUnit), 
            minimumBid: formData.type == 2 && formData.minimumBid ? Number(formData.minimumBid) : null,
            auctionEndTime: formData.type == 2 && formData.auctionEndTime ? 
                new Date(formData.auctionEndTime).toISOString() : null,
            closedAt: formData.status == 2 && formData.closedAt ? 
                new Date(formData.closedAt).toISOString() : null
        };

        console.log("Submitting payload:", payload);
        onSubmit(payload);
    };

    const handleApplySuggestion = () => {
        if (suggestedPrice) {
            const roundedPrice = Math.round(suggestedPrice);
            setFormData(prev => ({
                ...prev,
                pricePerUnit: roundedPrice,
                minimumBid: roundedPrice
            }));
            setValidationError(''); 
        }
    };

    if (!isOpen) return null;

   

    return (
        <div className={styles.modalStyle} onClick={onClose}>
            <div className={styles.modalContentStyle} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.filterTitle}>Chỉnh sửa niêm yết</h3>
                
                {isLoading && <p>Đang tải dữ liệu...</p>}
                {error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}
                {validationError && (
                    <div style={{ 
                        backgroundColor: '#ff4444', 
                        color: 'white', 
                        padding: '12px', 
                        borderRadius: '6px', 
                        marginBottom: '16px',
                        fontSize: '14px'
                    }}>
                        <i className="bi bi-exclamation-triangle" style={{ marginRight: '8px' }}></i>
                        {validationError}
                    </div>
                )}

                {!isLoading && !error && listingData && (
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label htmlFor="type" className={styles.formLabel}>Loại</label>
                                <select 
                                    id="type"
                                    name="type"
                                    className={styles.formSelect} 
                                    value={formData.type}
                                    onChange={handleChange}
                                >
                                    <option value="1">Giá cố định (FixedPrice)</option>
                                    <option value="2">Đấu giá (Auction)</option>
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="status" className={styles.formLabel}>Trạng thái</label>
                                <select 
                                    id="status"
                                    name="status"
                                    className={styles.formSelect}
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="1">Đang mở (Open)</option>
                                    <option value="2">Đã đóng (Closed)</option>
                                </select>
                            </div>

                            <div className="col-12">
                                {isSuggestionLoading && (
                                    <div className={styles.loadingBoxStyle}>
                                        <i className="bi bi-hourglass-split" style={{ marginRight: '8px' }}></i>
                                        Đang phân tích và tạo gợi ý từ AI...
                                    </div>
                                )}
                                {!isSuggestionLoading && suggestedPrice && (
                                    <div className={styles.suggestionBoxStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <i className="bi bi-stars" style={{ fontSize: '20px' }}></i>
                                            <div>
                                                <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '2px' }}>
                                                    Gợi ý giá từ AI
                                                </div>
                                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                                    {Math.round(suggestedPrice).toLocaleString()} VNĐ
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={handleApplySuggestion}
                                            className={styles.applyButtonStyle}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = 'white';
                                                e.target.style.transform = 'translateY(-2px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                                                e.target.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <i className="bi bi-check-circle" style={{ marginRight: '6px' }}></i>
                                            Áp dụng
                                        </button>
                                    </div>
                                )}
                            </div>

                            {formData.type == 1 ? (
                                <div className="col-12">
                                    <label htmlFor="pricePerUnit" className={styles.formLabel}>Giá/tín chỉ</label>
                                    <input
                                        type="number"
                                        id="pricePerUnit"
                                        name="pricePerUnit"
                                        className={styles.formControl}
                                        value={formData.pricePerUnit}
                                        onChange={handleChange}
                                        min="0"
                                        step="1000"
                                        required
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="col-md-6">
                                        <label htmlFor="pricePerUnit" className={styles.formLabel}>
                                            Giá/tín chỉ <span style={{color: '#ff6b6b'}}>*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="pricePerUnit"
                                            name="pricePerUnit"
                                            className={styles.formControl}
                                            value={formData.pricePerUnit}
                                            onChange={handleChange}
                                            min="0"
                                            step="1000"
                                            required
                                            style={validationError ? {borderColor: '#ff4444'} : {}}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="minimumBid" className={styles.formLabel}>Giá khởi điểm</label>
                                        <input
                                            type="number"
                                            id="minimumBid"
                                            name="minimumBid"
                                            className={styles.formControl}
                                            value={formData.minimumBid}
                                            onChange={handleChange}
                                            min="0"
                                            step="1000"
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label htmlFor="auctionEndTime" className={styles.formLabel}>Thời gian kết thúc</label>
                                        <input
                                            type="datetime-local"
                                            id="auctionEndTime"
                                            name="auctionEndTime"
                                            className={styles.formControl}
                                            value={formData.auctionEndTime}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </>
                            )}

                            {formData.status == 2 && (
                                <div className="col-12">
                                    <label htmlFor="closedAt" className={styles.formLabel}>Ngày đóng</label>
                                    <input
                                        type="datetime-local"
                                        id="closedAt"
                                        name="closedAt"
                                        className={styles.formControl}
                                        value={formData.closedAt}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}
                            
                            <div className="col-12 d-flex justify-content-end gap-2" style={{marginTop: '20px'}}>
                                <button 
                                    type="button" 
                                    className={`${styles.btnCustom} ${styles.btnOutlineCustom}`}
                                    onClick={onClose}
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit" 
                                    className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditListingModal;