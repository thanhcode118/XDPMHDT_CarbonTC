package com.carbontc.walletservice.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "carbon_wallets")
@Data
public class CarbonWallets {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long walletId;

    private String ownerId;

    private BigDecimal balance;

    private BigDecimal totalEarned;

    private LocalDateTime lastUpdated;

    @OneToMany(mappedBy = "fromWallet", cascade = CascadeType.ALL)
    private List<CarbonCreditTransfer>  outgoingTransfers;

    @OneToMany(mappedBy = "toWallet",cascade = CascadeType.ALL)
    private List<CarbonCreditTransfer>  incomingTransfers;


}
