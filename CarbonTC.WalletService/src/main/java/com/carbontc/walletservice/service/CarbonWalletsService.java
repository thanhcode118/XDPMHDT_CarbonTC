package com.carbontc.walletservice.service;

import com.carbontc.walletservice.dto.request.CreditTransferRequest;
import com.carbontc.walletservice.dto.response.CarbonWalletResponse;
import com.carbontc.walletservice.dto.response.CreditTransferResponse;
import com.carbontc.walletservice.exception.BusinessException;

public interface CarbonWalletsService {
    CarbonWalletResponse createCarbonWallet(String userId) throws BusinessException;
    CarbonWalletResponse getCarbonWalletByUserId(String userId) throws BusinessException;
    CreditTransferResponse transferCredits(String fromUserId, CreditTransferRequest request) throws BusinessException;
}
