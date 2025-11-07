package com.carbontc.walletservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonWalletResponse {

    private Long walletId;
    private String ownerId;
    private BigDecimal balance; // Số dư tín chỉ hiện tại
    private BigDecimal totalEarned; // Tổng tín chỉ đã kiếm được
    private LocalDateTime lastUpdated;
}
