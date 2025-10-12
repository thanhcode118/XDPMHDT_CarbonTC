package com.carbontc.walletservice.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "e_wallets")
public class EWallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long walletId;

    private Long userId;

    private Double balance;

    public Long getWalletId() {
        return walletId;
    }

    public void setWalletId(Long walletId) {
        this.walletId = walletId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Double getBalance() {
        return balance;
    }

    public void setBalance(Double balance) {
        this.balance = balance;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    private String currency;

    private LocalDateTime updatedAt;

    public List<Payment> getPayments() {
        return payments;
    }

    public void setPayments(List<Payment> payments) {
        this.payments = payments;
    }

    public List<WithdrawRequest> getWithdrawRequests() {
        return withdrawRequests;
    }

    public void setWithdrawRequests(List<WithdrawRequest> withdrawRequests) {
        this.withdrawRequests = withdrawRequests;
    }

    @OneToMany(mappedBy = "wallet", cascade = CascadeType.ALL)
    private List<Payment> payments;

    // 1 ví có thể có nhiều yêu cầu rút tiền
    @OneToMany(mappedBy = "wallet", cascade = CascadeType.ALL)
    private List<WithdrawRequest> withdrawRequests;
}
