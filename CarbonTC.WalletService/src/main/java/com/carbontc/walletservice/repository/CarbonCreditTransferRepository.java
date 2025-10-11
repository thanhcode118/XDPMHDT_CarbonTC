package com.carbontc.walletservice.repository;
import com.carbontc.walletservice.entity.CarbonCreditTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarbonCreditTransferRepository extends JpaRepository<CarbonCreditTransfer, Long> {
}
