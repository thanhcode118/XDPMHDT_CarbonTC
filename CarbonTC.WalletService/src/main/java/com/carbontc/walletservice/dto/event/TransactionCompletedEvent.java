package com.carbontc.walletservice.dto.event;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TransactionCompletedEvent {
    private String transactionId; // ID giao dịch gốc để Marketplace khớp
    private String status; // Trạng thái (COMPLETED hoặc FAILED)
    private Long certificateId; // ID của chứng chỉ đã tạo
    private String message; // Lý do (nếu FAILED)
    private LocalDateTime completedAt;
}
