package com.carbontc.walletservice.dto.event;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

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
    @JsonProperty("ownerUserId")
    private String ownerUserId;

    private BigDecimal creditAmount; // Số lượng tín chỉ MỚI

    @JsonProperty("referenceId")
    private String referenceId;

    private OffsetDateTime issuedAt;
}
