package com.carbontc.walletservice.repository;

import com.carbontc.walletservice.entity.TransactionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionLogRepository extends JpaRepository<TransactionLog,Long> {
    List<TransactionLog> findByWalletIdOrderByCreatedAtDesc(Long walletId);

    List<TransactionLog> findByStatusAndCreatedAtBefore(String pending, LocalDateTime cutoff);

}
