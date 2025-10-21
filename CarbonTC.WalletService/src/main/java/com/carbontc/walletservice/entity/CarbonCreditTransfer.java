package com.carbontc.walletservice.entity;


import com.carbontc.walletservice.entity.status.TransferType;
import jakarta.persistence.*;

import java.math.BigDecimal;
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
    @JoinColumn(name = "to_wallet_id")
    private CarbonWallets toWallet;

    public Long getTransferId() {
        return transferId;
    }

    public CarbonWallets getFromWallet() {
        return fromWallet;
    }

    public void setFromWallet(CarbonWallets fromWallet) {
        this.fromWallet = fromWallet;
    }

    public CarbonWallets getToWallet() {
        return toWallet;
    }

    public void setToWalletId(CarbonWallets toWalletId) {
        this.toWallet = toWalletId;
    }

    public void setTransferId(Long transferId) {
        this.transferId = transferId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setToWallet(CarbonWallets toWallet) {
        this.toWallet = toWallet;
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

    private BigDecimal amount;

    @Column(name = "transfer_type", nullable = false, length = 20)
    private TransferType transferType;

    private Long referenceId; // TransactionId or ListingId

    private LocalDateTime createdAt;

    public TransferType getTransferType() {
        return transferType;
    }

    public void setTransferType(TransferType transferType) {
        this.transferType = transferType;
    }
}
