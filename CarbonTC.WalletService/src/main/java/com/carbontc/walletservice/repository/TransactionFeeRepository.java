package com.carbontc.walletservice.repository;

import com.carbontc.walletservice.entity.TransactionFee;
import com.carbontc.walletservice.entity.status.FeeStatus;
import com.carbontc.walletservice.entity.status.FeeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionFeeRepository extends JpaRepository<TransactionFee, Long> {
    List<TransactionFee> findByStatus(FeeStatus status);
}
