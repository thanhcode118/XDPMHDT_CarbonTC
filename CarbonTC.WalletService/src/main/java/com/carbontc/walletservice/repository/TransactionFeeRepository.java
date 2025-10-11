package com.carbontc.walletservice.repository;

import com.carbontc.walletservice.entity.TransactionFee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionFeeRepository extends JpaRepository<TransactionFee, Long> {
}
