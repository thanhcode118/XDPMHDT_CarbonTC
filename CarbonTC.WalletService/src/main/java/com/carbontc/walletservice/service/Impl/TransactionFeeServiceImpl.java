package com.carbontc.walletservice.service.Impl;

import com.carbontc.walletservice.entity.EWallet;
import com.carbontc.walletservice.entity.TransactionFee;
import com.carbontc.walletservice.entity.status.FeeType;
import com.carbontc.walletservice.exception.BusinessException;
import com.carbontc.walletservice.repository.EWalletRepository;
import com.carbontc.walletservice.repository.TransactionFeeRepository;
import com.carbontc.walletservice.service.EWalletService;
import com.carbontc.walletservice.service.TransactionFeeService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionFeeServiceImpl implements TransactionFeeService {

    private final TransactionFeeRepository transactionFeeRepository;

    private final EWalletRepository eWalletRepository;

    private final EWalletService eWalletService;

    @Override
    public void recordFee(String transactionId, BigDecimal feeAmount, FeeType feeType) {
        TransactionFee transactionFee = new TransactionFee();
        transactionFee.setTransactionId(transactionId);
        transactionFee.setAmount(feeAmount);
        transactionFee.setFeeType(feeType);
        transactionFee.setCalculatedAt(LocalDateTime.now());
        transactionFee.setFeeType(feeType.PENDING_WITHDRAWAL);
        transactionFeeRepository.save(transactionFee);
    }

    @Override
    public BigDecimal withdrawPendingFeeToAdmin(String adminId) throws BusinessException {

        EWallet adminWallet = eWalletRepository.findByUserId(adminId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy ví admin"));


        List<TransactionFee> transactionFees = transactionFeeRepository.findByStatus(FeeType.PENDING_WITHDRAWAL);

        if (transactionFees.isEmpty()) {
            log.info("Không có phí nào chờ rút");
            return BigDecimal.ZERO;
        }

        BigDecimal totalFee = transactionFees.stream()
                .map(TransactionFee::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        eWalletService.deposit(adminWallet.getWalletId(), totalFee);

        for (TransactionFee transactionFee : transactionFees) {
            transactionFee.setFeeType(FeeType.WITHDRAWN);
        }
        transactionFeeRepository.saveAll(transactionFees);
        log.info("Đã rút thành công tiền về ví admin",totalFee,adminId);

        return totalFee;
    }
}
