package com.carbontc.walletservice.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EWalletResponse {
    private Long walletId;
    private Long userId;
    private Double balance;
    private String currency;
    private LocalDateTime updatedAt;
}
