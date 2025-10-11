package com.carbontc.walletservice.repository;

import com.carbontc.walletservice.entity.TransactionFee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionFeeRepository extends JpaRepository<TransactionFee, Long> {
}
