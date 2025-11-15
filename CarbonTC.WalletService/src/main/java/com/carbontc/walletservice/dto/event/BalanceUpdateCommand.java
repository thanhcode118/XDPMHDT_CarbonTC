package com.carbontc.walletservice.dto.event;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class BalanceUpdateCommand {
    private String userId;
    private BigDecimal newTotalBalance;
}
