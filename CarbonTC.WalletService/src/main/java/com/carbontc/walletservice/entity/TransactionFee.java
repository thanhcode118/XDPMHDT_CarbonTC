package com.carbontc.walletservice.entity;


import com.carbontc.walletservice.entity.status.FeeStatus;
import com.carbontc.walletservice.entity.status.FeeType;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transaction_fees")
public class TransactionFee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long feeId;

    public Long getFeeId() {
        return feeId;
    }

    public void setFeeId(Long feeId) {
        this.feeId = feeId;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public FeeType getFeeType() {
        return feeType;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public LocalDateTime getCalculatedAt() {
        return calculatedAt;
    }

    public void setCalculatedAt(LocalDateTime calculatedAt) {
        this.calculatedAt = calculatedAt;
    }

    private String transactionId;

    @Enumerated(EnumType.STRING)
    private FeeType feeType; // PlatformFee, ServiceFee

    @Enumerated(EnumType.STRING)
    private FeeStatus feeStatus;

    public FeeStatus getFeeStatus() {
        return feeStatus;
    }

    public void setFeeStatus(FeeStatus feeStatus) {
        this.feeStatus = feeStatus;
    }

    private BigDecimal amount;

    private Double percentage;

    public void setFeeType(FeeType feeType) {
        this.feeType = feeType;
    }

    public Payment getPayment() {
        return payment;
    }

    public void setPayment(Payment payment) {
        this.payment = payment;
    }

    private LocalDateTime calculatedAt;

    @OneToOne
    @JoinColumn(name = "payment_id")
    private Payment payment;

}