package com.carbontc.walletservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WithdrawRequestResponse {

        private Long requestId;

        private Long userId;

        private BigDecimal amount;

        private String status;

        private String bankAccountNumber;

        private String bankName;

        private LocalDateTime requestedAt;

        private LocalDateTime processedAt;
}
