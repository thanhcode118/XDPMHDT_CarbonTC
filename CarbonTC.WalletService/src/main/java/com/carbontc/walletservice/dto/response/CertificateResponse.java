package com.carbontc.walletservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
public class CertificateResponse {
    private String transactionId;
    private String certificate_url;
    private String certificate_hash;
}
