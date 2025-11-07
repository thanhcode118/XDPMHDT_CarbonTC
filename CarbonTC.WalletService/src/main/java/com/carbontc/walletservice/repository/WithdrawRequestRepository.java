package com.carbontc.walletservice.repository;

import com.carbontc.walletservice.entity.WithdrawRequest;
import com.carbontc.walletservice.entity.status.WithdrawStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WithdrawRequestRepository extends JpaRepository<WithdrawRequest, Long> {
    List<WithdrawRequest> findWithdrawRequestByStatus(WithdrawStatus status);

//    @Query("SELECT wr FROM WithdrawRequest wr JOIN FETCH wr.wallet WHERE wr.requestId = :id")
//    Optional<WithdrawRequest> findByIdWithWallet(@Param("id") Long id);
}
