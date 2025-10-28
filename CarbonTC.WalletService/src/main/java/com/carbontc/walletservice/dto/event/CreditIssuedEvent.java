package com.carbontc.walletservice.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Hợp đồng dữ liệu (DTO) cho sự kiện CREDIT_ISSUED
 * Ai gửi: Carbon Credit Lifecycle Service
 * Ai nhận: Wallet Service (consumer)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditIssuedEvent {

    private String ownerUserId;  // ID người nhận tín chỉ (String UUID)
    private BigDecimal creditAmount; // Số lượng tín chỉ MỚI
    private String referenceId;  // Mã tham chiếu (ví dụ: Batch ID)
    private LocalDateTime issuedAt;
}
