package com.carbontc.walletservice.service;

import com.carbontc.walletservice.exception.BusinessException;
import jakarta.servlet.http.HttpServletRequest;

import java.math.BigDecimal;
import java.util.Map;

public interface VNPayService {
    /**
     * Tạo URL thanh toán cơ bản.
     * @param vnp_TxnRef Mã giao dịch duy nhất (sẽ là ID của TransactionLog)
     * @param amount Số tiền
     * @param orderInfo Thông tin đơn hàng
     * @param ipAddr Địa chỉ IP
     * @return URL thanh toán
     */
    String createPaymentUrl(String vnp_TxnRef, BigDecimal amount, String orderInfo, String ipAddr) throws Exception;

    /**
     * Xác thực chữ ký từ callback của VNPay.
     * @param params Các tham số VNPay gửi về
     * @return true nếu chữ ký hợp lệ, false nếu ngược lại
     */
    boolean validateSignature(Map<String, String> params);
}
