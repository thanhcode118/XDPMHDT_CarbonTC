package com.carbontc.walletservice.service;

import java.io.IOException;

public interface CloudinaryService {
    public String uploadPdf(byte[] pdfBytes, String publicId) throws IOException;
}
