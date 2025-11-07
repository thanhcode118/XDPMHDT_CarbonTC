package com.carbontc.walletservice.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class SystemOverviewResponse {
    private long totalEWallets;
    private long totalCarbonWallets;
    private BigDecimal totalMoneyBalance;
    private BigDecimal totalCarbonBalance;
}
