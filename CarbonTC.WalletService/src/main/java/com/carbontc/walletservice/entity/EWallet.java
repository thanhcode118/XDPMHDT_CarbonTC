package com.carbontc.walletservice.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "e_wallets")
@Data
public class EWallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long walletId;

    private String userId;

    private BigDecimal balance;

    private String currency;

    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "wallet", cascade = CascadeType.ALL)
    private List<Payment> payments;

    // 1 ví có thể có nhiều yêu cầu rút tiền
    @OneToMany(mappedBy = "wallet", cascade = CascadeType.ALL)
    private List<WithdrawRequest> withdrawRequests;

    @OneToMany(mappedBy = "wallet", cascade = CascadeType.ALL)
    private List<TransactionLog> transactionLogs;
}
