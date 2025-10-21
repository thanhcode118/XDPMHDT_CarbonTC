package com.carbontc.walletservice.service;

import com.carbontc.walletservice.dto.request.CreditTransferRequest;
import com.carbontc.walletservice.dto.response.CarbonWalletResponse;
import com.carbontc.walletservice.dto.response.CreditTransferResponse;
import com.carbontc.walletservice.exception.BusinessException;

public interface CarbonWalletsService {
    CarbonWalletResponse createCarbonWallet(Long userId) throws BusinessException;

    CarbonWalletResponse getCarbonWalletByUserId(Long userId) throws BusinessException;

    CreditTransferResponse transferCredits(CreditTransferRequest request) throws BusinessException;

}
