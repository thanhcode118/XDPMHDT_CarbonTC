package com.carbontc.walletservice.controller;

import com.carbontc.walletservice.dto.request.CreditTransferRequest;
import com.carbontc.walletservice.dto.request.CreditTransferRequestForConsumer;
import com.carbontc.walletservice.dto.response.CarbonWalletResponse;
import com.carbontc.walletservice.dto.response.CreditTransferResponse;
import com.carbontc.walletservice.exception.BusinessException;
import com.carbontc.walletservice.payload.ApiResponse;
import com.carbontc.walletservice.service.CarbonWalletsService;
import com.carbontc.walletservice.util.AuthencationUtil;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // Thêm PreAuthorize
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/carbon-wallet")
@RequiredArgsConstructor
public class CarbonWalletController {

    private final CarbonWalletsService carbonWalletsService;

    private final AuthencationUtil authencationUtil;

    @Operation(summary = "Tạo ví Carbon cho người dùng hiện tại")
    @PostMapping("/my-wallet")
    public ResponseEntity<ApiResponse<CarbonWalletResponse>> createMyCarbonWallet() throws BusinessException {
        String userId = authencationUtil.getAuthenticatedUserId();

        CarbonWalletResponse carbonWalletResponse = carbonWalletsService.createCarbonWallet(userId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo ví carbon thành công", carbonWalletResponse));
    }

    @Operation(summary = "Xem chi tiết ví của người dùng hiện tại")
    @GetMapping("/my-wallet")
    public ResponseEntity<ApiResponse<CarbonWalletResponse>> getMyWallet() throws BusinessException {
        String userId =  authencationUtil.getAuthenticatedUserId();

        CarbonWalletResponse response = carbonWalletsService.getCarbonWalletByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin ví thành công", response));
    }

    @Operation(summary = "Chuyển tín chỉ từ ví của tôi cho người khác")
    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<CreditTransferResponse>> transferCredits(
            @Valid @RequestBody CreditTransferRequestForConsumer request) throws BusinessException {
        String fromUserId = authencationUtil.getAuthenticatedUserId();

        CreditTransferResponse response = carbonWalletsService.transferCredits(fromUserId, request);
        return ResponseEntity.ok(ApiResponse.success("Chuyển tín chỉ thành công", response));
    }

}