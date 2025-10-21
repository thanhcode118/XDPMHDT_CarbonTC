package com.carbontc.walletservice.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "carbon_wallets")
public class CarbonWallets {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long walletId;

    private Long ownerId;

    private BigDecimal balance;

    public Long getWalletId() {
        return walletId;
    }

    public void setWalletId(Long walletId) {
        this.walletId = walletId;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public BigDecimal getTotalEarned() {
        return totalEarned;
    }

    public void setTotalEarned(BigDecimal totalEarned) {
        this.totalEarned = totalEarned;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    private BigDecimal totalEarned;

    private LocalDateTime lastUpdated;

    @OneToMany(mappedBy = "fromWallet", cascade = CascadeType.ALL)
    private List<CarbonCreditTransfer>  outgoingTransfers;

    @OneToMany(mappedBy = "toWallet",cascade = CascadeType.ALL)
    private List<CarbonCreditTransfer>  incomingTransfers;

    public List<CarbonCreditTransfer> getOutgoingTransfers() {
        return outgoingTransfers;
    }

    public void setOutgoingTransfers(List<CarbonCreditTransfer> outgoingTransfers) {
        this.outgoingTransfers = outgoingTransfers;
    }

    public List<CarbonCreditTransfer> getIncomingTransfers() {
        return incomingTransfers;
    }

    public void setIncomingTransfers(List<CarbonCreditTransfer> incomingTransfers) {
        this.incomingTransfers = incomingTransfers;
    }
}
