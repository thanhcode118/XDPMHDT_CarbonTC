package com.carbontc.walletservice.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "payments")
@Data
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    @Column(name = "transaction_id", nullable = false, unique = true)
    private String transactionId;

    private String method; // E-Wallet, Banking, CreditCard

    private BigDecimal amount;

    private String paymentStatus; // Pending, Success, Failed

    private LocalDateTime paidAt;

    private String paymentGatewayRef;

    @ManyToOne
    @JoinColumn(name = "wallet_id")
    private EWallet wallet;

}
