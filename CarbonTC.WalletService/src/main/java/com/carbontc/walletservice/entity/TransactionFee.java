package com.carbontc.walletservice.entity;


import com.carbontc.walletservice.entity.status.FeeStatus;
import com.carbontc.walletservice.entity.status.FeeType;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transaction_fees")
@Data
public class TransactionFee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long feeId;

    private String transactionId;

    @Enumerated(EnumType.STRING)
    private FeeType feeType; // PlatformFee, ServiceFee

    @Enumerated(EnumType.STRING)
    private FeeStatus feeStatus;

    private BigDecimal amount;

    private Double percentage;

    private LocalDateTime calculatedAt;


}