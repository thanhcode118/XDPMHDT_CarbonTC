package com.carbontc.walletservice.repository;
import com.carbontc.walletservice.entity.CarbonCreditTransfer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarbonCreditTransferRepository extends JpaRepository<CarbonCreditTransfer, Long> {
}
