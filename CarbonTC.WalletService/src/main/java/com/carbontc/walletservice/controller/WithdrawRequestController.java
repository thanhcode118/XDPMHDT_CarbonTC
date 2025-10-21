package com.carbontc.walletservice.controller;

import com.carbontc.walletservice.dto.request.CreateWithdrawRequest;
import com.carbontc.walletservice.dto.response.WithdrawRequestResponse;
import com.carbontc.walletservice.exception.BusinessException;
import com.carbontc.walletservice.payload.ApiResponse;
import com.carbontc.walletservice.service.WithdrawRequestService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/withdraw-requests")
@RequiredArgsConstructor
public class WithdrawRequestController {

    private final WithdrawRequestService withdrawRequestService;

    @Operation(summary = "Tạo đề nghị rút tiền")
    @PostMapping
    public ResponseEntity<ApiResponse<WithdrawRequestResponse>> createWithdrawRequest(
            @Valid @RequestBody CreateWithdrawRequest request) throws BusinessException {

        WithdrawRequestResponse response = withdrawRequestService.createRequest(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Gửi yêu cầu rút tiền thành công. Chờ duyệt.", response));
    }

    @Operation(summary = "Admin duyệt chấp nhận rút tiền")
    @PostMapping("/{requestId}/approve")
    public ResponseEntity<ApiResponse<WithdrawRequestResponse>> approveRequest(@PathVariable Long requestId) throws BusinessException {
        WithdrawRequestResponse response = withdrawRequestService.rejectRequest(requestId);
        return ResponseEntity.ok(ApiResponse.success("Duyệt yêu cầu thành công, đã trừ tiền từ ví user.", response));
    }

    @Operation(summary = "Admin duyệt chấp nhận rút tiền")
    @PostMapping("/{requestId}/reject")
    public ResponseEntity<ApiResponse<WithdrawRequestResponse>> rejectRequest(@PathVariable Long requestId) throws BusinessException {
        WithdrawRequestResponse response = withdrawRequestService.rejectRequest(requestId);
        return ResponseEntity.ok(ApiResponse.success("Đã từ chối yêu cầu rút tiền.", response));
    }

}
