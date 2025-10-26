package com.carbontc.walletservice.service;

import jakarta.servlet.http.HttpServletRequest;

import java.math.BigDecimal;
import java.util.Map;

public interface PaymentService {
    String createDepositUrl(String userId, BigDecimal amount, HttpServletRequest request) throws Exception;

    /**
     * Xử lý callback (IPN) từ VNPay.
     * @param params Các tham số VNPay gửi về
     * @return Kết quả trả về cho VNPay Server
     */
    Map<String, String> handleVNPayCallback(Map<String, String> params) throws Exception;
}
