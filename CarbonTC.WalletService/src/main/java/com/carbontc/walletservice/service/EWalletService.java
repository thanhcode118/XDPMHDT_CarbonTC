package com.carbontc.walletservice.service;

import com.carbontc.walletservice.dto.response.EWalletResponse;
import com.carbontc.walletservice.dto.response.TransactionLogResponse;
import com.carbontc.walletservice.entity.EWallet;
import com.carbontc.walletservice.exception.BusinessException;

import java.math.BigDecimal;
import java.util.List;

public interface EWalletService {

    EWalletResponse createWallet(String userId) throws BusinessException;
    EWalletResponse deposit(Long walletId, BigDecimal amount) throws  BusinessException;
    EWalletResponse withdraw(Long walletId, BigDecimal amount ) throws BusinessException;
    EWalletResponse getMyWalletByUserId(String userId) throws BusinessException;
    EWallet findWalletByUserId(String userId) throws BusinessException;
    List<TransactionLogResponse> getTransactionHistoryByUserId(String userId) throws BusinessException;
}
