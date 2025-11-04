package com.carbontc.walletservice.controller;

import com.carbontc.walletservice.dto.request.CreateWithdrawRequest;
import com.carbontc.walletservice.dto.response.WithdrawRequestResponse;
import com.carbontc.walletservice.exception.BusinessException;
import com.carbontc.walletservice.payload.ApiResponse;
import com.carbontc.walletservice.service.WithdrawRequestService;
import com.carbontc.walletservice.util.AuthencationUtil;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/withdraw-requests")
@RequiredArgsConstructor
public class WithdrawRequestController {

    private final WithdrawRequestService withdrawRequestService;

    private final AuthencationUtil authencationUtil;

    @Operation(summary = "Tạo đề nghị rút tiền")
    @PostMapping
    public ResponseEntity<ApiResponse<WithdrawRequestResponse>> createWithdrawRequest(
            @Valid @RequestBody CreateWithdrawRequest request) throws BusinessException {

        String userId = authencationUtil.getAuthenticatedUserId();

        request.setUserId(userId);

        WithdrawRequestResponse response = withdrawRequestService.createRequest(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Gửi yêu cầu rút tiền thành công. Chờ duyệt.", response));
    }

}
