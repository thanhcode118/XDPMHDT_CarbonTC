package com.carbontc.walletservice.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Hợp đồng dữ liệu (DTO) cho sự kiện TRANSACTION_CREATED
 * Ai gửi: Marketplace Service
 * Ai nhận: Wallet Service (consumer)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionCreatedEvent {

    private String transactionId; // ID giao dịch gốc
    private String buyerUserId;   // ID người mua (String UUID)
    private String sellerUserId;  // ID người bán (String UUID)
    private BigDecimal moneyAmount;   // Tổng số tiền
    private BigDecimal creditAmount;  // Tổng số tín chỉ
    private BigDecimal platformFee;   // Phí nền tảng (hoa hồng)
    private LocalDateTime createdAt;
}
