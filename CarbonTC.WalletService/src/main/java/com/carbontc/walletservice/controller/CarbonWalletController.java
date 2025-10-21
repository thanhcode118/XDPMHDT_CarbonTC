package com.carbontc.walletservice.controller;

import com.carbontc.walletservice.dto.request.CreditTransferRequest;
import com.carbontc.walletservice.dto.response.CarbonWalletResponse;
import com.carbontc.walletservice.dto.response.CreditTransferResponse;
import com.carbontc.walletservice.exception.BusinessException;
import com.carbontc.walletservice.payload.ApiResponse;
import com.carbontc.walletservice.service.CarbonCreditTransferService;
import com.carbontc.walletservice.service.CarbonWalletsService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/carbon-wallet")
@RequiredArgsConstructor
public class CarbonWalletController {

    private final CarbonWalletsService carbonWalletsService;

    @Operation(summary = " Tạo ví Carbon cho người dùng")
    @PostMapping
    public ResponseEntity<ApiResponse<CarbonWalletResponse>> createCarbonWallet(@RequestParam Long id) throws BusinessException {
        CarbonWalletResponse carbonWalletResponse = carbonWalletsService.createCarbonWallet(id);

        return  ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Tạo ví carbon thành công", carbonWalletResponse));
    }

    @Operation(summary = "Xem chi tiết ví")
    @GetMapping
    public ResponseEntity<ApiResponse<CarbonWalletResponse>> getWalletByUserId(
            @RequestParam Long userId) throws BusinessException {
        // Tạm thời truyền userId, sau này sẽ là /my-wallet và lấy từ token
        CarbonWalletResponse response = carbonWalletsService.getCarbonWalletByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin ví thành công", response));
    }

    @Operation(summary = "Chuyển tín chỉ")
    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<CreditTransferResponse>> transferCredits(
            @Valid @RequestBody CreditTransferRequest request) throws BusinessException {

        CreditTransferResponse response = carbonWalletsService.transferCredits(request);
        return ResponseEntity.ok(ApiResponse.success("Chuyển tín chỉ thành công", response));
    }

}
