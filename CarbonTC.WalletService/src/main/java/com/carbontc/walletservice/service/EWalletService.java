package com.carbontc.walletservice.service;

import com.carbontc.walletservice.dto.request.EWalletRequest;
import com.carbontc.walletservice.dto.response.EWalletResponse;
import com.carbontc.walletservice.exception.BusinessException;

import java.math.BigDecimal;
import java.util.List;

public interface EWalletService {

    EWalletResponse createWallet(EWalletRequest request) throws BusinessException;
    EWalletResponse deposit(Long walletId, BigDecimal amount) throws  BusinessException;
    EWalletResponse withdraw(Long walletId, BigDecimal amount ) throws BusinessException;
    EWalletResponse getMyWalletById(Long userId) throws BusinessException;

}
