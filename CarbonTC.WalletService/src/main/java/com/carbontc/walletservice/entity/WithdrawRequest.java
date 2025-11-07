package com.carbontc.walletservice.entity;

import com.carbontc.walletservice.entity.status.WithdrawStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "withdraw_requests")
@Data
public class WithdrawRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    private String userId;

    private BigDecimal amount;

    @Enumerated(EnumType.STRING) // Quan trọng!
    @Column(name = "status", nullable = false, length = 20)
    private WithdrawStatus status;

    private String bankAccountNumber;

    private String bankName;

    private LocalDateTime requestedAt;

    private LocalDateTime processedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private EWallet wallet;


}