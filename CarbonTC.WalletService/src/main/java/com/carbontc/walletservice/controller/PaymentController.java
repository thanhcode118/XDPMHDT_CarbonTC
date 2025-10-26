package com.carbontc.walletservice.controller;

import com.carbontc.walletservice.dto.request.DepositRequest;
import com.carbontc.walletservice.exception.BusinessException;
import com.carbontc.walletservice.payload.ApiResponse;
import com.carbontc.walletservice.service.PaymentService;
import com.carbontc.walletservice.util.AuthencationUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    private final AuthencationUtil authencationUtil;

    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse<String>> createDepositPayment(
            @Valid @RequestBody DepositRequest depositRequest, // DTO này giờ chỉ có 'amount'
            HttpServletRequest request) throws BusinessException {

        String userId = authencationUtil.getAuthenticatedUserId();
        try {
            String paymentUrl = paymentService.createDepositUrl(
                    userId,
                    depositRequest.getAmount(),
                    request
            );
            return ResponseEntity.ok(ApiResponse.success("Tạo link thanh toán thành công.", paymentUrl));
        } catch (Exception e) {
            return ResponseEntity
                    .internalServerError()
                    .body(ApiResponse.fail("Lỗi khi tạo URL thanh toán.", e.getMessage()));
        }
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<ApiResponse<String>> vnpayReturn(@RequestParam Map<String, String> allParams) {
        try {
            Map<String, String> result = paymentService.handleVNPayCallback(allParams);

            String rspCode = result.get("RspCode");
            String message = result.get("Message");

            if ("00".equals(rspCode)) {
                return ResponseEntity.ok(ApiResponse.success("Giao dịch thành công và đã cập nhật số dư!", null));
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.fail("Giao dịch thất bại.", message));
            }
        } catch (Exception e) {
            return ResponseEntity
                    .internalServerError()
                    .body(ApiResponse.fail("Có lỗi xảy ra trong quá trình xử lý kết quả.", e.getMessage()));
        }
    }

}