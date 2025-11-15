package com.carbontc.walletservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class CanWithdrawRequest {
    private String userId;
    private BigDecimal amountToWithdraw;
}
