package com.carbontc.walletservice.service;

import com.carbontc.walletservice.dto.event.CreditIssuedEvent;
import com.carbontc.walletservice.dto.request.CreditTransferRequest;
import com.carbontc.walletservice.dto.request.CreditTransferRequestForConsumer;
import com.carbontc.walletservice.dto.response.CarbonWalletResponse;
import com.carbontc.walletservice.dto.response.CreditTransferResponse;
import com.carbontc.walletservice.dto.response.TransactionHistoryDto;
import com.carbontc.walletservice.entity.CarbonWallets;
import com.carbontc.walletservice.exception.BusinessException;

import java.util.List;

public interface CarbonWalletsService {
    CarbonWalletResponse createCarbonWallet(String userId) throws BusinessException;
    CarbonWalletResponse getCarbonWalletByUserId(String userId) throws BusinessException;
    void issueNewCredits(CreditIssuedEvent event) throws BusinessException;
    CarbonWallets findWalletByOwnerId(String userId) throws BusinessException ;
    CreditTransferResponse transferCredits(String fromUserId, CreditTransferRequestForConsumer request) throws BusinessException;
    public List<TransactionHistoryDto> getTransactionHistory(String currentUserId);
}
