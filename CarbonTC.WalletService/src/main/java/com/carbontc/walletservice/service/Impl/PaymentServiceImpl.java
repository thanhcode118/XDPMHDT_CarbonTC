package com.carbontc.walletservice.service.Impl;

import com.carbontc.walletservice.config.RabbitMQConfig;
import com.carbontc.walletservice.dto.event.BalanceUpdateCommand;
import com.carbontc.walletservice.entity.EWallet;
import com.carbontc.walletservice.entity.Payment;
import com.carbontc.walletservice.entity.TransactionLog;
import com.carbontc.walletservice.exception.BusinessException;
import com.carbontc.walletservice.repository.EWalletRepository;
import com.carbontc.walletservice.repository.PaymentRepository;
import com.carbontc.walletservice.repository.TransactionLogRepository;
import com.carbontc.walletservice.service.PaymentService;
import com.carbontc.walletservice.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final EWalletRepository eWalletRepository;
    private final TransactionLogRepository transactionLogRepository;
    private final VNPayService vnPayService;
    private final RabbitTemplate rabbitTemplate;
    private final PaymentRepository paymentRepository;

    @Override
    @Transactional
    public String createDepositUrl(String userId, BigDecimal amount, HttpServletRequest request) throws Exception {
        EWallet eWallet = eWalletRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy ví của người dùng."));

        Long walletId = eWallet.getWalletId();

        TransactionLog log = new TransactionLog();
        log.setWallet(eWallet);
        log.setAmount(amount);
        log.setType("DEPOSIT");
        log.setStatus("PENDING");
        log.setDescription("Chờ thanh toán nạp tiền qua VNPay");
        TransactionLog savedLog = transactionLogRepository.save(log);

        String ipAddr = getIpAddress(request);
        String orderInfo = "Nap tien vao vi " + eWallet.getUserId();

        // vnp_TxnRef gốc chính là ID của log
        String vnp_TxnRef = String.valueOf(savedLog.getId());

        return vnPayService.createPaymentUrl(vnp_TxnRef, amount, orderInfo, ipAddr);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, String> handleVNPayCallback(Map<String, String> params) throws Exception {
        Map<String, String> response = new HashMap<>();

        // Lấy lại vnp_TxnRef từ params
        String vnp_TxnRef_FromVNPAY = params.get("vnp_TxnRef");
        String transactionLogId = vnp_TxnRef_FromVNPAY.split("_")[0];
        if (!vnPayService.validateSignature(params)) {
            // Cập nhật log thất bại nếu chữ ký sai
            updateTransactionLogStatus(transactionLogId, "FAILED", "Invalid Checksum");
            response.put("RspCode", "97");
            response.put("Message", "Invalid Checksum");
            return response;
        }

        long amountFromVnpay = Long.parseLong(params.get("vnp_Amount")) / 100;
        TransactionLog log = transactionLogRepository.findById(Long.valueOf(transactionLogId))
                .orElse(null);

        if (log == null) {
            response.put("RspCode", "01");
            response.put("Message", "Order not found");
            return response;
        }

        if (!"PENDING".equals(log.getStatus())) {
            response.put("RspCode", "02");
            response.put("Message", "Order already confirmed");
            return response;
        }

        if (log.getAmount().longValue() != amountFromVnpay) {
            updateTransactionLogStatus(transactionLogId, "FAILED", "Invalid Amount");
            response.put("RspCode", "04");
            response.put("Message", "Invalid amount");
            return response;
        }

        String vnp_ResponseCode = params.get("vnp_ResponseCode");
        if ("00".equals(vnp_ResponseCode)) {
            EWallet eWallet = eWalletRepository.findById(log.getWallet().getWalletId())
                    .orElseThrow(() -> new BusinessException("Ví không tồn tại"));
            eWallet.setBalance(eWallet.getBalance().add(log.getAmount()));
            EWallet savedWallet = eWalletRepository.save(eWallet);

            log.setStatus("SUCCESS");
            log.setDescription("Nạp tiền thành công qua VNPay");
            transactionLogRepository.save(log);

            BalanceUpdateCommand event = new BalanceUpdateCommand();
            event.setUserId(savedWallet.getUserId());
            event.setNewTotalBalance(savedWallet.getBalance()); // Gửi số dư MỚI NHẤT

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.BALANCE_EXCHANGE,
                    RabbitMQConfig.BALANCE_UPDATE_ROUTING_KEY,
                    event
            );

            Payment payment = new Payment();
            payment.setWallet(eWallet); // Gán với EWallet
            payment.setAmount(log.getAmount());
            payment.setMethod("VNPAY");
            payment.setPaymentStatus("SUCCESS");
            payment.setPaidAt(LocalDateTime.now());

            payment.setTransactionId(params.get("vnp_TxnRef"));
            payment.setPaymentGatewayRef(params.get("vnp_TransactionNo"));

            paymentRepository.save(payment);

            response.put("RspCode", "00");
            response.put("Message", "Confirm Success");
        } else {
            updateTransactionLogStatus(transactionLogId, "FAILED", "Giao dịch thất bại từ VNPay");
            response.put("RspCode", "00");
            response.put("Message", "Confirm Success");
        }

        return response;
    }

    private void updateTransactionLogStatus(String logId, String status, String description) {
        try {
            TransactionLog log = transactionLogRepository.findById(Long.valueOf(logId)).orElse(null);
            if (log != null) {
                log.setStatus(status);
                log.setDescription(description);
                transactionLogRepository.save(log);
            }
        } catch (Exception e) {
            // Ghi log lỗi nếu cần
        }
    }

    private String getIpAddress(HttpServletRequest request) {
        String ipAdress;
        try {
            ipAdress = request.getHeader("X-FORWARDED-FOR");
            if (ipAdress == null) {
                ipAdress = request.getRemoteAddr();
            }
        } catch (Exception e) {
            ipAdress = "Invalid IP:" + e.getMessage();
        }
        return ipAdress;
    }
}