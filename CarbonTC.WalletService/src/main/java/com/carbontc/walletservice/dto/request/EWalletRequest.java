package com.carbontc.walletservice.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class EWalletRequest {
    private Long userId;
    private String currency;
    private BigDecimal amount;
}
