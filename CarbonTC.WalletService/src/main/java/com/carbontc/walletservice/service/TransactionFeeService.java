package com.carbontc.walletservice.service;

import com.carbontc.walletservice.entity.status.FeeType;
import com.carbontc.walletservice.exception.BusinessException;

import java.math.BigDecimal;

public interface TransactionFeeService {
    /**
     * Ghi lại một khoản phí giao dịch vào DB.
     * @param transactionId ID của giao dịch gốc (từ Marketplace)
     * @param feeAmount Số tiền phí (hoa hồng)
     * @param feeType Loại phí
     */
    void recordFee(String transactionId, BigDecimal feeAmount, FeeType feeType);

    public BigDecimal withdrawPendingFeeToAdmin(String adminId) throws BusinessException;

}
