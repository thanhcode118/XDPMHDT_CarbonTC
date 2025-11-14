package com.carbontc.walletservice.repository;
import com.carbontc.walletservice.entity.CarbonCreditTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarbonCreditTransferRepository extends JpaRepository<CarbonCreditTransfer, Long> {
    /**
     * Tìm tất cả giao dịch liên quan đến một userId cụ thể.
     * Logic: Lấy nếu userId là chủ ví gửi (FROM) HOẶC chủ ví nhận (TO).
     * Sắp xếp: Mới nhất lên đầu (DESC).
     */
    @Query("SELECT c FROM CarbonCreditTransfer c " +
            "WHERE c.fromWallet.ownerId = :userId " +
            "OR c.toWallet.ownerId = :userId " +
            "ORDER BY c.createdAt DESC")
    List<CarbonCreditTransfer> findAllHistoryByUserId(@Param("userId") String userId);
}
