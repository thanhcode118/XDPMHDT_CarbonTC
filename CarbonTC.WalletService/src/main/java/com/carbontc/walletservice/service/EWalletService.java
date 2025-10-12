package com.carbontc.walletservice.service;

import com.carbontc.walletservice.dto.request.EWalletRequest;
import com.carbontc.walletservice.dto.response.EWalletResponse;
import com.carbontc.walletservice.exception.BusinessException;

import java.util.List;

public interface EWalletService {

    EWalletResponse createWallet(EWalletRequest request) throws BusinessException;
    EWalletResponse deposit(Long walletId, EWalletRequest request);
    EWalletResponse withdraw(Long walletId, EWalletRequest request);
    EWalletResponse getWalletById(Long walletId);
    List<EWalletResponse> getAllWallets();
}
