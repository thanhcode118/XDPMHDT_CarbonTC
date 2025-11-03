package com.carbontc.walletservice.repository;
import com.carbontc.walletservice.entity.EWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface EWalletRepository extends JpaRepository<EWallet, Long> {
    Optional<EWallet> findByUserId(String userId);

    boolean existsByUserId(String userId);

    @Query("SELECT SUM(c.balance) FROM EWallet c")
    BigDecimal getTotalBalance();
}
