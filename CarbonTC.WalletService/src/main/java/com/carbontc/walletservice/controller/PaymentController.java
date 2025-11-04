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
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.web.util.UriComponentsBuilder;

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
    public RedirectView vnpayReturn(@RequestParam Map<String, String> allParams) {

        // 1. URL của trang Frontend (FE) bạn vừa cung cấp
        String feReturnUrl = "http://localhost:5173/payment/return";

        String vnp_TxnRef = allParams.get("vnp_TxnRef");
        String vnp_ResponseCode = allParams.get("vnp_ResponseCode");

        try {
            // 2. Xử lý logic backend (xác thực chữ ký, cộng tiền vào ví)
            Map<String, String> result = paymentService.handleVNPayCallback(allParams);
            vnp_ResponseCode = result.get("RspCode");

            // Xây dựng URL redirect về FE
            UriComponentsBuilder urlBuilder = UriComponentsBuilder.fromHttpUrl(feReturnUrl)
                    .queryParam("vnp_TxnRef", vnp_TxnRef)
                    .queryParam("vnp_ResponseCode", vnp_ResponseCode);

            if ("00".equals(vnp_ResponseCode)) {
                // 3a. Thành công
                urlBuilder.queryParam("success", "true");
            } else {
                // 3b. Thất bại (từ VNPAY)
                urlBuilder.queryParam("success", "false")
                        .queryParam("message", result.get("Message"));
            }

            return new RedirectView(urlBuilder.toUriString());

        } catch (Exception e) {

            UriComponentsBuilder urlBuilder = UriComponentsBuilder.fromHttpUrl(feReturnUrl)
                    .queryParam("success", "false")
                    .queryParam("vnp_TxnRef", vnp_TxnRef)
                    .queryParam("vnp_ResponseCode", "99") // Mã lỗi hệ thống
                    .queryParam("message", "He_thong_dang_ban_vui_long_thu_lai_sau");

            return new RedirectView(urlBuilder.toUriString());
        }
    }

}