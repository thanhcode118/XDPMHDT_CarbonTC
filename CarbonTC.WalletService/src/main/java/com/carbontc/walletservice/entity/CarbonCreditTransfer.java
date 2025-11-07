package com.carbontc.walletservice.entity;


import com.carbontc.walletservice.entity.status.TransferType;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "carbon_credit_transfers")
@Data
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

    private BigDecimal amount;

    @Column(name = "transfer_type", nullable = false, length = 20)
    private TransferType transferType;

    private String referenceId; // TransactionId or ListingId

    private LocalDateTime createdAt;

}
