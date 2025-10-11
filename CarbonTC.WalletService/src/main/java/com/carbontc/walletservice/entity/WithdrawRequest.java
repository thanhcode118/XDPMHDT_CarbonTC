package com.carbontc.walletservice.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "withdraw_requests")
public class WithdrawRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    private Long userId;

    private Double amount;

    private String status; // Pending, Approved, Rejected, Paid

    private String bankAccountNumber;

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    private String bankName;

    private LocalDateTime requestedAt;

    private LocalDateTime processedAt;

}