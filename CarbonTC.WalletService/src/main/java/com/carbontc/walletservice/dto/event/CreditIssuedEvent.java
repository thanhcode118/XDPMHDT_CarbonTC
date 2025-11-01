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
    @JsonProperty("ownerUserld")
    private String ownerUserId;

    private BigDecimal creditAmount; // Số lượng tín chỉ MỚI

    @JsonProperty("referenceld")
    private String referenceId;

    private LocalDateTime issuedAt;
}
