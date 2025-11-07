package com.carbontc.walletservice.repository;

import com.carbontc.walletservice.entity.TransactionFee;
import com.carbontc.walletservice.entity.status.FeeStatus;
import com.carbontc.walletservice.entity.status.FeeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionFeeRepository extends JpaRepository<TransactionFee, Long> {
    List<TransactionFee> findByFeeStatus(FeeStatus status);

    @Query("SELECT SUM(f.amount) FROM TransactionFee f " +
            "WHERE f.feeType = :feeType " +
            "AND f.calculatedAt BETWEEN :startDate AND :endDate")
    BigDecimal sumFeesByDateRange(
            @Param("feeType") FeeType feeType,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
