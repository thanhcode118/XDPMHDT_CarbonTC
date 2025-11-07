import React, { useState, useEffect } from 'react';
import { convertUTCToVnTime, formatForDateTimeInput, convertVnTimeToUTC } from '../../utils/formatters';
import styles from '../../pages/Marketplace/Marketplace.module.css'; 

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
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        if (listingData) {
            // Chuyển đổi thời gian từ UTC sang VN time để hiển thị
            const vnAuctionEndTime = listingData.auctionEndTime 
                ? formatForDateTimeInput(convertUTCToVnTime(listingData.auctionEndTime))
                : '';
                
            const vnClosedAt = listingData.closedAt
                ? formatForDateTimeInput(convertUTCToVnTime(listingData.closedAt))
                : '';

            setFormData({
                type: listingData.type || 1,
                status: listingData.status || 1,
                pricePerUnit: listingData.pricePerUnit || 0,
                minimumBid: listingData.minimumBid || 0,
                auctionEndTime: vnAuctionEndTime,
                closedAt: vnClosedAt
            });
        }
        setValidationErrors({});
    }, [listingData, isOpen]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        
        // Clear validation errors when user changes input
        setValidationErrors(prev => ({ ...prev, [name]: '' }));
        
        if (type === 'number') {
            setFormData(prev => ({ 
                ...prev, 
                [name]: value === '' ? 0 : Number(value) 
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const validateForm = () => {
        const errors = {};
        // Basic enum validation
        if (![1, 2].includes(formData.type)) {
            errors.type = 'INVALID_LISTING_TYPE';
        }

        if (![1, 2, 3].includes(formData.status)) {
            errors.status = 'INVALID_LISTING_STATUS';
        }

        // Fixed Price validation
        if (formData.type === 1) {
            if (formData.status === 1) { // Open status
                if (!formData.pricePerUnit || formData.pricePerUnit <= 0) {
                    errors.pricePerUnit = 'PRICE_PER_UNIT_REQUIRED_FOR_FIXED_PRICE';
                }
                
                if (formData.minimumBid && formData.minimumBid > 0) {
                    errors.minimumBid = 'MINIMUM_BID_MUST_BE_NULL_FOR_FIXED_PRICE';
                }
                
                if (formData.auctionEndTime) {
                    errors.auctionEndTime = 'AUCTION_END_TIME_MUST_BE_NULL_FOR_FIXED_PRICE';
                }
            }
        }

        // Auction validation
        if (formData.type === 2) {
            if (formData.status === 1) { // Open status
                // PricePerUnit is optional but must be positive if provided
                if (formData.pricePerUnit !== null && formData.pricePerUnit <= 0) {
                    errors.pricePerUnit = 'PRICE_MUST_BE_POSITIVE';
                }

                // MinimumBid is required for auction
                if (!formData.minimumBid || formData.minimumBid <= 0) {
                    errors.minimumBid = 'MINIMUM_BID_REQUIRED_FOR_AUCTION';
                }

                // AuctionEndTime validation
                if (!formData.auctionEndTime) {
                    errors.auctionEndTime = 'AUCTION_END_TIME_REQUIRED_FOR_AUCTION';
                } else {
                    const utcAuctionEnd = convertVnTimeToUTC(formData.auctionEndTime);
                    const utcNow = new Date().toISOString();

                    if (new Date(utcAuctionEnd) <= new Date(utcNow)) {
                        errors.auctionEndTime = 'AUCTION_END_TIME_MUST_BE_IN_FUTURE';
                    } else {
                        const duration = new Date(utcAuctionEnd) - new Date(utcNow);
                        const minDuration = 60 * 60 * 1000; // 1 hour in milliseconds
                        const maxDuration = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

                        if (duration < minDuration || duration > maxDuration) {
                            errors.auctionEndTime = 'AUCTION_DURATION_INVALID';
                        }
                    }
                }
            }
        }

        // Closed status validation
        if (formData.status === 2 || formData.status === 3) { // Closed or Sold
            if (!formData.closedAt) {
                errors.closedAt = 'CLOSED_AT_REQUIRED_FOR_CLOSED_STATUS';
            } else {
                const utcClosedAt = convertVnTimeToUTC(formData.closedAt);
                const utcNow = new Date().toISOString();

                if (new Date(utcClosedAt) > new Date(utcNow)) {
                    errors.closedAt = 'CLOSED_AT_CANNOT_BE_IN_FUTURE';
                }
            }
        }

        // Open status validation
        if (formData.status === 1) {
            if (formData.closedAt) {
                errors.closedAt = 'CLOSED_AT_MUST_BE_NULL_FOR_OPEN_STATUS';
            }
        }

        // Business logic validations
        if (formData.type === 2 && formData.status === 1) {
            const hasValidAuctionFields = 
                (!formData.pricePerUnit || formData.pricePerUnit > 0) &&
                formData.minimumBid &&
                formData.minimumBid > 0 &&
                formData.auctionEndTime &&
                new Date(convertVnTimeToUTC(formData.auctionEndTime)) > new Date();

            if (!hasValidAuctionFields) {
                errors.general = 'INVALID_AUCTION_FIELDS_FOR_OPEN_STATUS';
            }
        }

        if (formData.type === 1 && formData.status === 1) {
            const hasValidFixedPriceFields = 
                formData.pricePerUnit &&
                formData.pricePerUnit > 0 &&
                !formData.minimumBid &&
                !formData.auctionEndTime;

            if (!hasValidFixedPriceFields) {
                errors.general = 'INVALID_FIXED_PRICE_FIELDS_FOR_OPEN_STATUS';
            }
        }

        return errors;
    };

    const getErrorMessage = (errorCode) => {
        const errorMessages = {
            'INVALID_LISTING_STATUS': 'Trạng thái niêm yết không hợp lệ',
            'INVALID_LISTING_TYPE': 'Loại niêm yết không hợp lệ',
            'PRICE_PER_UNIT_REQUIRED_FOR_FIXED_PRICE': 'Giá/tín chỉ là bắt buộc cho niêm yết giá cố định',
            'PRICE_MUST_BE_POSITIVE': 'Giá phải lớn hơn 0',
            'MINIMUM_BID_MUST_BE_NULL_FOR_FIXED_PRICE': 'Giá khởi điểm phải để trống cho niêm yết giá cố định',
            'AUCTION_END_TIME_MUST_BE_NULL_FOR_FIXED_PRICE': 'Thời gian kết thúc phải để trống cho niêm yết giá cố định',
            'MINIMUM_BID_REQUIRED_FOR_AUCTION': 'Giá khởi điểm là bắt buộc cho đấu giá',
            'MINIMUM_BID_MUST_BE_POSITIVE': 'Giá khởi điểm phải lớn hơn 0',
            'AUCTION_END_TIME_REQUIRED_FOR_AUCTION': 'Thời gian kết thúc là bắt buộc cho đấu giá',
            'AUCTION_END_TIME_MUST_BE_IN_FUTURE': 'Thời gian kết thúc phải ở tương lai',
            'AUCTION_DURATION_INVALID': 'Thời gian đấu giá phải từ 1 giờ đến 30 ngày',
            'CLOSED_AT_REQUIRED_FOR_CLOSED_STATUS': 'Thời gian đóng là bắt buộc khi trạng thái là đã đóng',
            'CLOSED_AT_CANNOT_BE_IN_FUTURE': 'Thời gian đóng không thể ở tương lai',
            'CLOSED_AT_MUST_BE_NULL_FOR_OPEN_STATUS': 'Thời gian đóng phải để trống khi trạng thái là đang mở',
            'INVALID_AUCTION_FIELDS_FOR_OPEN_STATUS': 'Thông tin đấu giá không hợp lệ cho trạng thái đang mở',
            'INVALID_FIXED_PRICE_FIELDS_FOR_OPEN_STATUS': 'Thông tin giá cố định không hợp lệ cho trạng thái đang mở'
        };

        return errorMessages[errorCode] || errorCode;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        // Chuyển đổi thời gian từ VN time sang UTC trước khi gửi lên server
        const payload = {
            type: Number(formData.type),
            status: Number(formData.status),
            pricePerUnit: formData.pricePerUnit ? Number(formData.pricePerUnit) : null,
            minimumBid: formData.type === 2 && formData.minimumBid ? Number(formData.minimumBid) : null,
            auctionEndTime: formData.type === 2 && formData.auctionEndTime ? 
                convertVnTimeToUTC(formData.auctionEndTime) : null,
            closedAt: (formData.status === 2 || formData.status === 3) && formData.closedAt ? 
                convertVnTimeToUTC(formData.closedAt) : null
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
                minimumBid: prev.type === 2 ? roundedPrice : prev.minimumBid
            }));
            setValidationErrors(prev => ({ 
                ...prev, 
                pricePerUnit: '',
                minimumBid: '' 
            }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalStyle} onClick={onClose}>
            <div className={styles.modalContentStyle} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.filterTitle}>Chỉnh sửa niêm yết</h3>
                
                {isLoading && <p>Đang tải dữ liệu...</p>}
                {error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}
                
                {/* General validation errors */}
                {validationErrors.general && (
                    <div style={{ 
                        backgroundColor: '#ff4444', 
                        color: 'white', 
                        padding: '12px', 
                        borderRadius: '6px', 
                        marginBottom: '16px',
                        fontSize: '14px'
                    }}>
                        <i className="bi bi-exclamation-triangle" style={{ marginRight: '8px' }}></i>
                        {getErrorMessage(validationErrors.general)}
                    </div>
                )}

                {!isLoading && !error && listingData && (
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label htmlFor="type" className={styles.formLabel}>Loại niêm yết</label>
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
                                {validationErrors.type && (
                                    <div className="text-danger small mt-1">
                                        {getErrorMessage(validationErrors.type)}
                                    </div>
                                )}
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
                                    <option value="3">Đã bán (Sold)</option>
                                </select>
                                {validationErrors.status && (
                                    <div className="text-danger small mt-1">
                                        {getErrorMessage(validationErrors.status)}
                                    </div>
                                )}
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
                                        >
                                            <i className="bi bi-check-circle" style={{ marginRight: '6px' }}></i>
                                            Áp dụng
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Price Per Unit - Always show but with different validation */}
                            <div className="col-md-6">
                                <label htmlFor="pricePerUnit" className={styles.formLabel}>
                                    Giá/tín chỉ {formData.type === 1 && formData.status === 1 && <span style={{color: '#ff6b6b'}}>*</span>}
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
                                    required={formData.type === 1 && formData.status === 1}
                                />
                                {validationErrors.pricePerUnit && (
                                    <div className="text-danger small mt-1">
                                        {getErrorMessage(validationErrors.pricePerUnit)}
                                    </div>
                                )}
                            </div>

                            {/* Minimum Bid - Only relevant for auctions */}
                            {formData.type === 2 && (
                                <div className="col-md-6">
                                    <label htmlFor="minimumBid" className={styles.formLabel}>
                                        Giá khởi điểm {formData.status === 1 && <span style={{color: '#ff6b6b'}}>*</span>}
                                    </label>
                                    <input
                                        type="number"
                                        id="minimumBid"
                                        name="minimumBid"
                                        className={styles.formControl}
                                        value={formData.minimumBid}
                                        onChange={handleChange}
                                        min="0"
                                        step="1000"
                                        required={formData.status === 1}
                                    />
                                    {validationErrors.minimumBid && (
                                        <div className="text-danger small mt-1">
                                            {getErrorMessage(validationErrors.minimumBid)}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Auction End Time - Only for auctions */}
                            {formData.type === 2 && (
                                <div className="col-12">
                                    <label htmlFor="auctionEndTime" className={styles.formLabel}>
                                        Thời gian kết thúc đấu giá {formData.status === 1 && <span style={{color: '#ff6b6b'}}>*</span>}
                                    </label>
                                    <input
                                        type="datetime-local"
                                        id="auctionEndTime"
                                        name="auctionEndTime"
                                        className={styles.formControl}
                                        value={formData.auctionEndTime}
                                        onChange={handleChange}
                                        required={formData.status === 1}
                                    />
                                    <small className="text-muted">
                                        Thời gian được hiển thị theo múi giờ Việt Nam (UTC+7). Thời gian đấu giá phải từ 1 giờ đến 30 ngày.
                                    </small>
                                    {validationErrors.auctionEndTime && (
                                        <div className="text-danger small mt-1">
                                            {getErrorMessage(validationErrors.auctionEndTime)}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Closed At - Only for closed/sold status */}
                            {(formData.status === 2 || formData.status === 3) && (
                                <div className="col-12">
                                    <label htmlFor="closedAt" className={styles.formLabel}>
                                        Thời gian đóng <span style={{color: '#ff6b6b'}}>*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        id="closedAt"
                                        name="closedAt"
                                        className={styles.formControl}
                                        value={formData.closedAt}
                                        onChange={handleChange}
                                        required
                                    />
                                    <small className="text-muted">
                                        Thời gian được hiển thị theo múi giờ Việt Nam (UTC+7). Thời gian đóng không thể ở tương lai.
                                    </small>
                                    {validationErrors.closedAt && (
                                        <div className="text-danger small mt-1">
                                            {getErrorMessage(validationErrors.closedAt)}
                                        </div>
                                    )}
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
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
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