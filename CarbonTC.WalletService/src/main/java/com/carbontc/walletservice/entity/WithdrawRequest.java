package com.carbontc.walletservice.entity;

import com.carbontc.walletservice.entity.status.WithdrawStatus;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "withdraw_requests")
public class WithdrawRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    private Long userId;

    private BigDecimal amount;

    @Enumerated(EnumType.STRING) // Quan trọng!
    @Column(name = "status", nullable = false, length = 20)
    private WithdrawStatus status;

    public WithdrawStatus getStatus() {
        return status;
    }

    public void setStatus(WithdrawStatus status) {
        this.status = status;
    }

    private String bankAccountNumber;

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    private String bankName;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getBankAccountNumber() {
        return bankAccountNumber;
    }

    public void setBankAccountNumber(String bankAccountNumber) {
        this.bankAccountNumber = bankAccountNumber;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }

    public EWallet getWallet() {
        return wallet;
    }

    public void setWallet(EWallet wallet) {
        this.wallet = wallet;
    }

    private LocalDateTime requestedAt;

    private LocalDateTime processedAt;

    @ManyToOne
    @JoinColumn(name = "wallet_id")
    private EWallet wallet;


}