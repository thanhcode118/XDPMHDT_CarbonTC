package com.carbontc.walletservice.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transaction_logs")
@Data
public class TransactionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false) // Tên cột trong DB
    private EWallet wallet; // Biến Java

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false, length = 20)
    private String type; // DEPOSIT, WITHDRAW

    @Column(nullable = false, length = 20)
    private String status; // SUCCESS, FAILED

    private String description;

    private LocalDateTime createdAt = LocalDateTime.now();
}
