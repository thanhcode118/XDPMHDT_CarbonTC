package com.carbontc.walletservice.controller;

import com.carbontc.walletservice.dto.request.EWalletRequest;
import com.carbontc.walletservice.dto.response.EWalletResponse;
import com.carbontc.walletservice.exception.BusinessException;
import com.carbontc.walletservice.payload.ApiResponse;
import com.carbontc.walletservice.service.EWalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/wallet")
@RequiredArgsConstructor
public class EWalletController {

    private final EWalletService eWalletService;

    @Operation(summary = "Tạo ví cho người dùng")
    @PostMapping
    public ResponseEntity<ApiResponse<EWalletResponse>>  createWallet(@RequestBody EWalletRequest eWalletRequest) throws BusinessException {
        EWalletResponse eWalletResponse = new EWalletResponse();
        eWalletResponse = eWalletService.createWallet(eWalletRequest);

        return ResponseEntity.ok(ApiResponse.success("Tạo ví thành công", eWalletResponse));

    }
}
