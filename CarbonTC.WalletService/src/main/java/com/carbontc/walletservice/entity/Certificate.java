package com.carbontc.walletservice.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "certificates")
@Data
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long certificateId;

    private String transactionId;

    private String buyerId;

    private BigDecimal creditAmount;

    private String certificateUrl;

    private String uniqueHash;

    private LocalDateTime issuedAt;

    private LocalDateTime expiryDate;

    private String certificateNumber;

}