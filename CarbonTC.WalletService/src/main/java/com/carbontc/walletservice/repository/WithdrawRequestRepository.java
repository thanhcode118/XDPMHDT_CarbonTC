package com.carbontc.walletservice.repository;

import com.carbontc.walletservice.entity.WithdrawRequest;
import com.carbontc.walletservice.entity.status.WithdrawStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WithdrawRequestRepository extends JpaRepository<WithdrawRequest, Long> {
    List<WithdrawRequest> findWithdrawRequestByStatus(WithdrawStatus status);
}
