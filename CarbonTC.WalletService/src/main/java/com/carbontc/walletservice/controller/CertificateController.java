package com.carbontc.walletservice.controller;

import com.carbontc.walletservice.dto.response.CertificateResponse;
import com.carbontc.walletservice.exception.BusinessException;
import com.carbontc.walletservice.payload.ApiResponse;
import com.carbontc.walletservice.service.CertificateService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // Cho phép cả User và Admin
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @Operation(summary = "Tải về file PDF chứng nhận bằng mã hash")
    @GetMapping("/download/{uniqueHash}")
    // Cho phép người dùng đã đăng nhập (bất kỳ ai có cert đó) tải về
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadCertificate(@PathVariable String uniqueHash) {
        try {
            return certificateService.downloadCertificateByHash(uniqueHash);
        } catch (BusinessException e) {
            HttpHeaders headers = new HttpHeaders();
            headers.add("Error-Message", e.getMessage()); // Gửi thông báo lỗi qua header
            return new ResponseEntity<>(null, headers, HttpStatus.BAD_REQUEST);
        } catch (IOException e) {
            HttpHeaders headers = new HttpHeaders();
            headers.add("Error-Message", "Lỗi khi tải file từ nơi lưu trữ.");
            return new ResponseEntity<>(null, headers, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "Lấy chứng chỉ")
    @GetMapping("/certificate/{transactionId}")
    public ResponseEntity<ApiResponse<CertificateResponse>> getCertificate(@PathVariable String transactionId) throws BusinessException {
            CertificateResponse result = certificateService.getCertificateByTransactionId(transactionId);
            return ResponseEntity.ok(ApiResponse.success("Lấy chứng chỉ thành công", result));
    }
}