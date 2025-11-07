package com.carbontc.walletservice.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EWalletResponse {
    private Long walletId;
    private String userId;
    private Double balance;
    private String currency;
    private LocalDateTime updatedAt;
}
