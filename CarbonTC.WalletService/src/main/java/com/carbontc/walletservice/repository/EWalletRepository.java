package com.carbontc.walletservice.repository;
import com.carbontc.walletservice.entity.EWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EWalletRepository extends JpaRepository<EWallet, Long> {
    Optional<EWallet> findByUserId(Long userId);
}
