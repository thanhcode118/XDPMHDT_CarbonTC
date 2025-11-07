package com.carbontc.walletservice.controller;

import com.carbontc.walletservice.dto.request.EWalletRequest;
import com.carbontc.walletservice.dto.response.EWalletResponse;
import com.carbontc.walletservice.dto.response.TransactionLogResponse;
import com.carbontc.walletservice.entity.EWallet;
import com.carbontc.walletservice.exception.BusinessException;
import com.carbontc.walletservice.payload.ApiResponse;
import com.carbontc.walletservice.service.EWalletService;
import com.carbontc.walletservice.util.AuthencationUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("api/wallet")
@RequiredArgsConstructor
public class EWalletController {

    private final EWalletService eWalletService;

    private final AuthencationUtil authencationUtil;

    @Operation(summary = "Tạo ví cho người dùng")
    @PostMapping("/my-wallet")
    public ResponseEntity<ApiResponse<EWalletResponse>> createWallet(
            @RequestBody @Valid EWalletRequest eWalletRequest) throws BusinessException {
        String userId = authencationUtil.getAuthenticatedUserId();
        EWalletResponse eWalletResponse = eWalletService.createWallet(userId, eWalletRequest);
        return ResponseEntity.ok(ApiResponse.success("Tạo ví thành công", eWalletResponse));
    }

    @Operation(summary = "Nộp tiền cho ví")
    @PostMapping("/{id}/diposit")
    public ResponseEntity<ApiResponse<EWalletResponse>> CreateDiposit(@PathVariable Long id , @RequestParam BigDecimal amout) throws BusinessException {
        EWalletResponse eWalletResponse = eWalletService.deposit(id, amout);
        return ResponseEntity.ok(ApiResponse.success("Nộp tiền thành công", eWalletResponse));
    }

    @Operation(summary = "Chi tiết ví")
    @GetMapping("/my-wallet")
    public ResponseEntity<ApiResponse<EWalletResponse>> getMyWallet() throws BusinessException {
        String userId = authencationUtil.getAuthenticatedUserId();

        EWalletResponse eWalletResponse = eWalletService.getMyWalletByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy ví người dùng thành công", eWalletResponse));
    }

    @Operation(summary = "Lịch sử giao dịch của ví")
    @GetMapping("/my-wallet/transactions")
    public ResponseEntity<ApiResponse<List<TransactionLogResponse>>> getMyTransactionHistory() throws BusinessException {
        String userId = authencationUtil.getAuthenticatedUserId();

        List<TransactionLogResponse> logs = eWalletService.getTransactionHistoryByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử giao dịch thành công", logs));
    }

}
