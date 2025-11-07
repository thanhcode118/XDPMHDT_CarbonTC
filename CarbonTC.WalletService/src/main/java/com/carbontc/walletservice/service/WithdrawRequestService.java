package com.carbontc.walletservice.service;

import com.carbontc.walletservice.dto.request.CreateWithdrawRequest;
import com.carbontc.walletservice.dto.response.WithdrawRequestResponse;
import com.carbontc.walletservice.exception.BusinessException;

import java.util.List;

public interface WithdrawRequestService {
    WithdrawRequestResponse createRequest(CreateWithdrawRequest request) throws BusinessException;

    // Admin
    WithdrawRequestResponse approveRequest(Long requestId) throws BusinessException; // Thêm hàm duyệt
    WithdrawRequestResponse rejectRequest(Long requestId) throws BusinessException;  // Thêm hàm từ chối

    List<WithdrawRequestResponse> getPendingRequests() throws BusinessException;


}
