import React, { useState, useEffect } from 'react';
import styles from '../PlaceBidModal/MarketplaceModal.module.css';

const BuyNowModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    listingData,
    isLoading, 
    isSubmitting,
    error
}) => {
    const [quantityError, setQuantityError] = useState('');
    // const [showTermsModal, setShowTermsModal] = useState(false);

    const [formData, setFormData] = useState({
        buyQuantity: 1,
        buyerNote: '',
        paymentMethod: 'bank',
        agreeTerms: false
    });

    useEffect(() => {
        if (listingData && isOpen) {
            setFormData(prev => ({
                ...prev,
                buyQuantity: 1,
                buyerNote: '',
                paymentMethod: 'bank',
                agreeTerms: false
            }));
            setQuantityError('');
        }
        console.log('BuyNowModal listingData:', listingData);
    }, [listingData, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newFormValue = type === 'checkbox' ? checked : value;

        if (name === 'buyQuantity') {
            const numValue = parseFloat(value);

            if (!value) {
                setQuantityError('Vui lòng nhập số lượng.');
            } else if (isNaN(numValue)) {
                setQuantityError('Chỉ được nhập số.');
            } else if (numValue <= 0) {
                setQuantityError('Số lượng phải lớn hơn 0.');
            } else if (numValue > maxQuantity) {
                newFormValue = maxQuantity.toString(); 
                setQuantityError(''); 
            } else {
                setQuantityError('');
            }
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: newFormValue
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (quantityError) {
            return;
        }

        if (!formData.agreeTerms) {
            alert('Vui lòng đồng ý với điều khoản giao dịch');
            return;
        }

        const buyData = {
            quantity: parseFloat(formData.buyQuantity),
            note: formData.buyerNote,
            paymentMethod: formData.paymentMethod,
            totalAmount: (listingData?.pricePerUnit || 0) * parseFloat(formData.buyQuantity)
        };

        onSubmit(buyData);
    };

    if (!isOpen) return null;

    const unitPrice = listingData?.pricePerUnit || 0;
    const maxQuantity = listingData?.quantity || 1;
    const totalPrice = unitPrice * (parseFloat(formData.buyQuantity) || 0);

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h5 className={styles.modalTitle}>Mua tín chỉ carbon</h5>
                    <button 
                        type="button" 
                        className={styles.btnClose} 
                        onClick={onClose}
                    >
                        <i className="bi bi-x"></i>
                    </button>
                </div>
                
                {isLoading && <p>Đang tải chi tiết...</p>}
        
                {error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}
                
                {!isLoading && !error && listingData && (
                    <>
                        <div className={styles.modalBody}>
                        {/* Transaction Summary */}
                        <div className={styles.transactionSummary}>
                            <div className={styles.summaryHeader}>
                                <h6 className={styles.summaryTitle}>Thông tin giao dịch</h6>
                                <span className={`${styles.summaryStatus} ${styles.statusAvailable}`}>
                                    Có sẵn
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
                                        <i className="bi bi-currency-dollar"></i>
                                    </div>
                                    <div className={styles.detailInfo}>
                                        <div className={styles.detailLabel}>Đơn giá</div>
                                        <div className={styles.detailValue}>
                                            {unitPrice.toLocaleString()} VNĐ/tín chỉ
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.summaryDetail}>
                                    <div className={`${styles.detailIcon} ${styles.detailIcon3}`}>
                                        <i className="bi bi-calculator"></i>
                                    </div>
                                    <div className={styles.detailInfo}>
                                        <div className={styles.detailLabel}>Tổng giá trị</div>
                                        <div className={styles.detailValue}>
                                            {totalPrice.toLocaleString()} VNĐ
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

                        {/* Payment Methods */}
                        <div className={styles.paymentMethods}>
                            <h6 className={styles.paymentMethodTitle}>Phương thức thanh toán</h6>
                            
                            <div 
                                className={`${styles.paymentMethod} ${
                                    formData.paymentMethod === 'bank' ? styles.selected : ''
                                }`}
                                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'bank' }))}
                            >
                                <div className={`${styles.paymentMethodIcon} ${styles.bankIcon}`}>
                                    <i className="bi bi-credit-card"></i>
                                </div>
                                <div className={styles.paymentMethodInfo}>
                                    <div className={styles.paymentMethodName}>Chuyển khoản ngân hàng</div>
                                    <div className={styles.paymentMethodDescription}>
                                        Thanh toán qua tài khoản ngân hàng
                                    </div>
                                </div>
                                <div className={styles.paymentMethodRadio}>
                                    <input
                                        className={styles.formCheckInput}
                                        type="radio"
                                        name="paymentMethod"
                                        value="bank"
                                        checked={formData.paymentMethod === 'bank'}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            
                            <div 
                                className={`${styles.paymentMethod} ${
                                    formData.paymentMethod === 'ewallet' ? styles.selected : ''
                                }`}
                                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'ewallet' }))}
                            >
                                <div className={`${styles.paymentMethodIcon} ${styles.ewalletIcon}`}>
                                    <i className="bi bi-wallet2"></i>
                                </div>
                                <div className={styles.paymentMethodInfo}>
                                    <div className={styles.paymentMethodName}>Ví điện tử</div>
                                    <div className={styles.paymentMethodDescription}>
                                        Thanh toán qua MoMo, ZaloPay, VNPay
                                    </div>
                                </div>
                                <div className={styles.paymentMethodRadio}>
                                    <input
                                        className={styles.formCheckInput}
                                        type="radio"
                                        name="paymentMethod"
                                        value="ewallet"
                                        checked={formData.paymentMethod === 'ewallet'}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            
                            <div 
                                className={`${styles.paymentMethod} ${
                                    formData.paymentMethod === 'crypto' ? styles.selected : ''
                                }`}
                                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'crypto' }))}
                            >
                                <div className={`${styles.paymentMethodIcon} ${styles.cryptoIcon}`}>
                                    <i className="bi bi-currency-bitcoin"></i>
                                </div>
                                <div className={styles.paymentMethodInfo}>
                                    <div className={styles.paymentMethodName}>Tiền điện tử</div>
                                    <div className={styles.paymentMethodDescription}>
                                        Thanh toán qua Bitcoin, Ethereum
                                    </div>
                                </div>
                                <div className={styles.paymentMethodRadio}>
                                    <input
                                        className={styles.formCheckInput}
                                        type="radio"
                                        name="paymentMethod"
                                        value="crypto"
                                        checked={formData.paymentMethod === 'crypto'}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <form id="buyCreditsForm" onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label htmlFor="buyQuantity" className={styles.formLabel}>
                                    Số lượng tín chỉ muốn mua
                                </label>
                                <input
                                    type="number"
                                    className={`${styles.formControl} ${quantityError ? styles.isInvalid : ''}`}
                                    id="buyQuantity"
                                    name="buyQuantity"
                                    value={formData.buyQuantity}
                                    onChange={handleChange}
                                    min="0.01"      
                                    step="any"      
                                    max={maxQuantity} 
                                    required
                                />
                                {quantityError ? (
                                    <small className={styles.textDanger}>{quantityError}</small>
                                ) : (
                                    <small className={styles.textSecondary}>
                                        Số lượng tối đa: {maxQuantity.toLocaleString()} tín chỉ
                                    </small>
                                )}
                            </div>
                            
                            {/* <div className={styles.formGroup}>
                                <label htmlFor="buyerNote" className={styles.formLabel}>
                                    Ghi chú (tùy chọn)
                                </label>
                                <textarea
                                    className={styles.formControl}
                                    id="buyerNote"
                                    name="buyerNote"
                                    rows="3"
                                    value={formData.buyerNote}
                                    onChange={handleChange}
                                    placeholder="Nhập ghi chú cho người bán"
                                />
                            </div> */}
                            
                            <div className={styles.formGroup}>
                                <div className={`${styles.formCheck} ${!formData.agreeTerms ? styles.requiredField : ''}`}>
                                    <input
                                        className={styles.formCheckInput}
                                        type="checkbox"
                                        id="agreeTerms"
                                        name="agreeTerms"
                                        checked={formData.agreeTerms}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label className={styles.formCheckLabel} htmlFor="agreeTerms">
                                        Tôi đồng ý với các <span 
                                            className={styles.termsLink} 
                                            // onClick={() => setShowTermsModal(true)}
                                        >
                                            điều khoản và điều kiện
                                        </span> giao dịch
                                    </label>
                                </div>
                               
                                {!formData.agreeTerms && (
                                    <small className={styles.textDanger}>Vui lòng đồng ý với điều khoản giao dịch</small>
                                )}
                            </div>
                        </form>
                        </div>
                        
                        <div className={styles.modalFooter}>
                            <button 
                                type="button" 
                                className={`${styles.btnCustom} ${styles.btnOutlineCustom}`}
                                onClick={onClose}
                                disabled={isSubmitting} 
                            >
                                Hủy
                            </button>
                            <button 
                                type="submit" 
                                className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
                                onClick={handleSubmit}
                                disabled={!!quantityError || !formData.agreeTerms || isSubmitting}
                            >
                                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận mua'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BuyNowModal;