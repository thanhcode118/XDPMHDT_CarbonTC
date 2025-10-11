package com.carbontc.walletservice.repository;
import com.carbontc.walletservice.entity.EWallet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EWalletRepository extends JpaRepository<EWallet, Long> {
}
