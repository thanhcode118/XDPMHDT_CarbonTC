package com.carbontc.walletservice.service.Impl;

import com.carbontc.walletservice.entity.TransactionFee;
import com.carbontc.walletservice.entity.status.FeeType;
import com.carbontc.walletservice.repository.TransactionFeeRepository;
import com.carbontc.walletservice.service.TransactionFeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TransactionFeeServiceImpl implements TransactionFeeService {

    private final TransactionFeeRepository transactionFeeRepository;

    @Override
    public void recordFee(String transactionId, BigDecimal feeAmount, FeeType feeType) {
        TransactionFee transactionFee = new TransactionFee();
        transactionFee.setTransactionId(transactionId);
        transactionFee.setAmount(feeAmount);
        transactionFee.setFeeType(feeType);
        transactionFee.setCalculatedAt(LocalDateTime.now());

        transactionFeeRepository.save(transactionFee);
    }
}
