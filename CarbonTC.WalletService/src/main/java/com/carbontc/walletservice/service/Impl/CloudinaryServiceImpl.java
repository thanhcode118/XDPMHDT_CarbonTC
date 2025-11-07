package com.carbontc.walletservice.service.Impl;

import com.carbontc.walletservice.service.CloudinaryService;
import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class); // Thêm Logger

    /**
     * Upload file PDF lên Cloudinary và trả về URL download chuẩn.
     */
    @Override
    public String uploadPdf(byte[] pdfBytes, String publicId) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(pdfBytes,
                ObjectUtils.asMap(
                        "resource_type", "raw",
                        "public_id", "certificates/" + publicId + ".pdf", // THÊM .pdf VÀO ĐÂY
                        "overwrite", true,
                        "access_mode", "public"
                ));

        String secureUrl = (String) uploadResult.get("secure_url");
        log.info("PDF uploaded successfully: {}", secureUrl);

        return secureUrl;
    }
}
