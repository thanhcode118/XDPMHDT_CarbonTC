package com.carbontc.walletservice.dto.response;

import com.carbontc.walletservice.entity.status.TransferType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@Data
@Builder
public class CreditTransferResponse {

    private Long transferId;
    private Long fromWalletId;
    private Long toWalletId;
    private BigDecimal amount;
    private TransferType transferType;
    private String referenceId;
    private OffsetDateTime createdAt;
}
