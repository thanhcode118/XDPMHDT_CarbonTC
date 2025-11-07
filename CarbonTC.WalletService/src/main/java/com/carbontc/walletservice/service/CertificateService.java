package com.carbontc.walletservice.service;

import com.carbontc.walletservice.dto.response.CertificateResponse;
import com.carbontc.walletservice.entity.Certificate;
import com.carbontc.walletservice.exception.BusinessException;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.math.BigDecimal;

public interface CertificateService {
    Certificate createCertificate(String transactionId, String buyerUserId, BigDecimal creditAmount);

    /**
     * THÊM HÀM MỚI: Tải file chứng nhận dựa trên mã hash.
     * @param uniqueHash Mã hash duy nhất của chứng nhận.
     * @return ResponseEntity chứa byte[] của file PDF và các header cần thiết.
     * @throws BusinessException Nếu không tìm thấy chứng nhận hoặc lỗi tải file.
     */
    ResponseEntity<byte[]> downloadCertificateByHash(String uniqueHash) throws BusinessException, IOException;

    CertificateResponse getCertificateByTransactionId(String transactionId) throws BusinessException;
}