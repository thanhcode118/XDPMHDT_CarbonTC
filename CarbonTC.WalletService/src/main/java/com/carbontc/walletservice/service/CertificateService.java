package com.carbontc.walletservice.service;

import com.carbontc.walletservice.entity.Certificate;

import java.math.BigDecimal;

public interface CertificateService {
    Certificate createCertificate(String transactionId, String buyerUserId, BigDecimal creditAmount);
}
