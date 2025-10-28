package com.carbontc.walletservice.service.Impl;

import com.carbontc.walletservice.entity.Certificate;
import com.carbontc.walletservice.repository.CertificateRepository;
import com.carbontc.walletservice.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CertificateServiceImpl implements CertificateService {

    private final CertificateRepository certificateRepository;

    @Override
    @Transactional(rollbackFor =  Exception.class)
    public Certificate createCertificate(String transactionId, String buyerUserId, BigDecimal creditAmount) {

        Certificate cert = new Certificate();
        cert.setTransactionId(transactionId);
        cert.setBuyerId(buyerUserId);
        cert.setCreditAmount(creditAmount);
        cert.setIssuedAt(LocalDateTime.now());
        cert.setExpiryDate(LocalDateTime.now().plusYears(1)); // Ví dụ: Hạn 1 năm

        // Tạo các mã định danh duy nhất
        String uniqueHash = UUID.randomUUID().toString();
        String serialNumber = "CERT-" + System.currentTimeMillis() + "-" + buyerUserId.substring(0, 4);

        cert.setUniqueHash(uniqueHash);
        cert.setCertificateNumber(serialNumber);

        // URL giả lập. Sau này có thể trỏ đến 1 API/trang để xem/download PDF
        cert.setCertificateUrl("/api/certificates/view/" + uniqueHash);

        // Lưu và trả về entity (để Consumer lấy ID)
        return certificateRepository.save(cert);
    }
}