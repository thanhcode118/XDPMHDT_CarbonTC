package com.carbontc.walletservice.entity;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "carbon_credit_transfers")
public class CarbonCreditTransfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transferId;

    @ManyToOne
    @JoinColumn(name = "from_wallet_id")
    private CarbonWallets fromWallet;

    @ManyToOne
    @JoinColumn(name = " to_wallet_id")
    private CarbonWallets toWalletId;

    public Long getTransferId() {
        return transferId;
    }

    public CarbonWallets getFromWallet() {
        return fromWallet;
    }

    public void setFromWallet(CarbonWallets fromWallet) {
        this.fromWallet = fromWallet;
    }

    public CarbonWallets getToWalletId() {
        return toWalletId;
    }

    public void setToWalletId(CarbonWallets toWalletId) {
        this.toWalletId = toWalletId;
    }

    public void setTransferId(Long transferId) {
        this.transferId = transferId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getTransferType() {
        return transferType;
    }

    public void setTransferType(String transferType) {
        this.transferType = transferType;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    private Double amount;

    private String transferType; // Sale, Gift, Adjustment, Refund

    private Long referenceId; // TransactionId or ListingId

    private LocalDateTime createdAt;



}
