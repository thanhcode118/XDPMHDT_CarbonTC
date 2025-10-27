import React, { useState, useEffect } from 'react';
import styles from './MarketplaceModal.module.css';

const PlaceBidModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    listingData 
}) => {
    const [formData, setFormData] = useState({
        bidAmount: '',
        bidQuantity: 1,
        maxBidAmount: '',
        agreeAuctionTerms: false
    });

    useEffect(() => {
        if (listingData && isOpen) {
            // Set minimum bid amount (current price + 1)
            const minBid = (listingData.currentPrice || listingData.minimumBid) + 1;
            setFormData(prev => ({
                ...prev,
                bidAmount: minBid.toString(),
                bidQuantity: 1,
                maxBidAmount: '',
                agreeAuctionTerms: false
            }));
        }
    }, [listingData, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.agreeAuctionTerms) {
            alert('Vui lòng đồng ý với điều khoản đấu giá');
            return;
        }

        const bidData = {
            bidAmount: Number(formData.bidAmount),
            bidQuantity: Number(formData.bidQuantity),
            maxBidAmount: formData.maxBidAmount ? Number(formData.maxBidAmount) : null
        };

        onSubmit(bidData);
    };

    if (!isOpen) return null;

    const minBid = (listingData?.currentPrice || listingData?.minimumBid || 0) + 1;
    const maxQuantity = listingData?.quantity || 1;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h5 className={styles.modalTitle}>Đặt giá cho phiên đấu giá</h5>
                    <button 
                        type="button" 
                        className={styles.btnClose} 
                        onClick={onClose}
                    >
                        <i className="bi bi-x"></i>
                    </button>
                </div>
                
                <div className={styles.modalBody}>
                    {/* Auction Information */}
                    <div className={styles.transactionSummary}>
                        <div className={styles.summaryHeader}>
                            <h6 className={styles.summaryTitle}>Thông tin phiên đấu giá</h6>
                            <span className={`${styles.summaryStatus} ${styles.statusAuction}`}>
                                Đang diễn ra
                            </span>
                        </div>
                        <div className={styles.summaryDetails}>
                            <div className={styles.summaryDetail}>
                                <div className={`${styles.detailIcon} ${styles.detailIcon1}`}>
                                    <i className="bi bi-lightning-charge-fill"></i>
                                </div>
                                <div className={styles.detailInfo}>
                                    <div className={styles.detailLabel}>Số lượng tín chỉ</div>
                                    <div className={styles.detailValue}>
                                        {listingData?.quantity?.toLocaleString()} tín chỉ
                                    </div>
                                </div>
                            </div>
                            <div className={styles.summaryDetail}>
                                <div className={`${styles.detailIcon} ${styles.detailIcon2}`}>
                                    <i className="bi bi-tag-fill"></i>
                                </div>
                                <div className={styles.detailInfo}>
                                    <div className={styles.detailLabel}>Giá khởi điểm</div>
                                    <div className={styles.detailValue}>
                                        {listingData?.minimumBid?.toLocaleString()} VNĐ/tín chỉ
                                    </div>
                                </div>
                            </div>
                            <div className={styles.summaryDetail}>
                                <div className={`${styles.detailIcon} ${styles.detailIcon3}`}>
                                    <i className="bi bi-clock-fill"></i>
                                </div>
                                <div className={styles.detailInfo}>
                                    <div className={styles.detailLabel}>Thời gian còn lại</div>
                                    <div className={styles.detailValue}>
                                        {listingData?.timeRemaining || '2 ngày 14 giờ'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.summaryDetail}>
                            <div className={`${styles.detailIcon} ${styles.detailIcon1}`}>
                                <i className="bi bi-person-fill"></i>
                            </div>
                            <div className={styles.detailInfo}>
                                <div className={styles.detailLabel}>Người bán</div>
                                <div className={styles.detailValue}>{listingData?.seller}</div>
                            </div>
                        </div>
                    </div>

                    {/* Current Bid */}
                    <div className={styles.currentBid}>
                        <div className={styles.currentBidLabel}>Giá hiện tại</div>
                        <div className={styles.currentBidValue}>
                            {(listingData?.currentPrice || listingData?.minimumBid)?.toLocaleString()} VNĐ
                        </div>
                    </div>

                    {/* Bid Form */}
                    <form id="placeBidForm" onSubmit={handleSubmit}>
                        <div className={styles.bidInputGroup}>
                            <input
                                type="number"
                                className={`${styles.formControl} ${styles.bidInput}`}
                                id="bidAmount"
                                name="bidAmount"
                                value={formData.bidAmount}
                                onChange={handleChange}
                                min={minBid}
                                placeholder="Nhập giá của bạn"
                                required
                            />
                            <span className={styles.bidInputAddon}>VNĐ/tín chỉ</span>
                        </div>
                        <small className={styles.textSecondary}>
                            Giá tối thiểu: {minBid.toLocaleString()} VNĐ/tín chỉ
                        </small>
                        
                        <div className={styles.formGroup}>
                            <label htmlFor="bidQuantity" className={styles.formLabel}>
                                Số lượng tín chỉ muốn mua
                            </label>
                            <input
                                type="number"
                                className={styles.formControl}
                                id="bidQuantity"
                                name="bidQuantity"
                                value={formData.bidQuantity}
                                onChange={handleChange}
                                min="1"
                                max={maxQuantity}
                                required
                            />
                            <small className={styles.textSecondary}>
                                Số lượng tối đa: {maxQuantity.toLocaleString()} tín chỉ
                            </small>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label htmlFor="maxBidAmount" className={styles.formLabel}>
                                Đặt giá tự động (tùy chọn)
                            </label>
                            <div className={styles.inputGroup}>
                                <input
                                    type="number"
                                    className={styles.formControl}
                                    id="maxBidAmount"
                                    name="maxBidAmount"
                                    value={formData.maxBidAmount}
                                    onChange={handleChange}
                                    placeholder="Giá tối đa bạn sẵn sàng trả"
                                />
                                <span className={styles.inputGroupText}>VNĐ/tín chỉ</span>
                            </div>
                            <small className={styles.textSecondary}>
                                Hệ thống sẽ tự động đặt giá thay bạn khi có người khác trả giá cao hơn, 
                                cho đến khi đạt mức giá tối đa này.
                            </small>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <div className={styles.formCheck}>
                                <input
                                    className={styles.formCheckInput}
                                    type="checkbox"
                                    id="agreeAuctionTerms"
                                    name="agreeAuctionTerms"
                                    checked={formData.agreeAuctionTerms}
                                    onChange={handleChange}
                                    required
                                />
                                <label className={styles.formCheckLabel} htmlFor="agreeAuctionTerms">
                                    Tôi đồng ý với các điều khoản và điều kiện của phiên đấu giá
                                </label>
                            </div>
                        </div>
                    </form>
                </div>
                
                <div className={styles.modalFooter}>
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
                        onClick={handleSubmit}
                    >
                        Đặt giá
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlaceBidModal;