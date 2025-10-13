package com.carbontc.walletservice.controller;

import com.carbontc.walletservice.dto.request.EWalletRequest;
import com.carbontc.walletservice.dto.response.EWalletResponse;
import com.carbontc.walletservice.entity.EWallet;
import com.carbontc.walletservice.exception.BusinessException;
import com.carbontc.walletservice.payload.ApiResponse;
import com.carbontc.walletservice.service.EWalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("api/wallet")
@RequiredArgsConstructor
public class EWalletController {

    private final EWalletService eWalletService;

    @Operation(summary = "Tạo ví cho người dùng")
    @PostMapping
    public ResponseEntity<ApiResponse<EWalletResponse>>  createWallet( @RequestBody @Valid EWalletRequest eWalletRequest) throws BusinessException {
        EWalletResponse eWalletResponse = eWalletService.createWallet(eWalletRequest);
        return ResponseEntity.ok(ApiResponse.success("Tạo ví thành công", eWalletResponse));
    }

    @Operation(summary = "Nộp tiền cho ví")
    @PostMapping("/{id}/diposit")
    public ResponseEntity<ApiResponse<EWalletResponse>> CreateDiposit(@PathVariable Long id , @RequestParam BigDecimal amout) throws BusinessException {
        EWalletResponse eWalletResponse = eWalletService.deposit(id, amout);
        return ResponseEntity.ok(ApiResponse.success("Nộp tiền thành công", eWalletResponse));
    }

    @Operation(summary = "Rút tiền ra khỏi ví")
    @PostMapping("/{id}/withDraw")
    public ResponseEntity<ApiResponse<EWalletResponse>> CreatWithDraw(@PathVariable Long id , @RequestParam BigDecimal amout) throws BusinessException {
        EWalletResponse eWalletResponse = eWalletService.withdraw(id, amout);
        return ResponseEntity.ok(ApiResponse.success("Rút tiền thành công", eWalletResponse));
    }

    @Operation(summary = "Chi tiết ví")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EWalletResponse>> GetWallet(@PathVariable Long id) throws BusinessException {
        EWalletResponse eWalletResponse = eWalletService.getMyWalletById(id);

        return ResponseEntity.ok(ApiResponse.success("Lấy ví người dùng thành công", eWalletResponse));
    }
}
