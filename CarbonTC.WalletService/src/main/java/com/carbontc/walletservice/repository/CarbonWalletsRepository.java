package com.carbontc.walletservice.repository;
import com.carbontc.walletservice.entity.CarbonWallets;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CarbonWalletsRepository extends JpaRepository<CarbonWallets, Long>
{
    boolean existsByOwnerId(Long ownerId);

    Optional<CarbonWallets> findByOwnerId(Long ownerId);
}
