package com.carbontc.walletservice.repository;
import com.carbontc.walletservice.entity.CarbonWallets;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface CarbonWalletsRepository extends JpaRepository<CarbonWallets, Long>
{
    boolean existsByOwnerId(String ownerId);

    Optional<CarbonWallets> findByOwnerId(String ownerId);

    @Query("SELECT SUM(c.balance) FROM CarbonWallets c")
    BigDecimal getTotalBalance();
}
