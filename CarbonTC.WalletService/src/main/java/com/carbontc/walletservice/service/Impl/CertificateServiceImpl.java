package com.carbontc.walletservice.service.Impl;

import com.carbontc.walletservice.entity.Certificate;
import com.carbontc.walletservice.exception.BusinessException;
import com.carbontc.walletservice.repository.CertificateRepository;
import com.carbontc.walletservice.service.CertificateService;
import com.carbontc.walletservice.service.CloudinaryService;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CertificateServiceImpl implements CertificateService {

    private static final Logger log = LoggerFactory.getLogger(CertificateServiceImpl.class);
    private final CertificateRepository certificateRepository;
    private final CloudinaryService cloudinaryService;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String LOGO_URL = "https://res.cloudinary.com/dxzk5p80d/image/upload/v1761755969/anhcoin_at2e0k.jpg";

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Certificate createCertificate(String transactionId, String buyerUserId, BigDecimal creditAmount) {
        Optional<Certificate> existingCert = certificateRepository.findByTransactionId(transactionId);
        if (existingCert.isPresent()) {
            log.warn("Certificate đã tồn tại cho transaction {}, skip tạo mới", transactionId);
            return existingCert.get();
        }

        String uniqueHash = UUID.randomUUID().toString();
        String serialNumber = "CTC-" + System.currentTimeMillis();

        Certificate cert = new Certificate();
        cert.setTransactionId(transactionId);
        cert.setBuyerId(buyerUserId);
        cert.setCreditAmount(creditAmount);
        cert.setUniqueHash(uniqueHash);
        cert.setCertificateNumber(serialNumber);
        cert.setIssuedAt(LocalDateTime.now());

        byte[] pdfBytes = generatePdfBytes(cert, transactionId, buyerUserId, creditAmount, serialNumber);

        if (pdfBytes != null) {
            try {
                String uploadedUrl = cloudinaryService.uploadPdf(pdfBytes, uniqueHash);
                cert.setCertificateUrl(uploadedUrl);
                log.info("PDF uploaded successfully: {}", uploadedUrl);
            } catch (IOException e) {
                log.error("Lỗi upload PDF: {}", e.getMessage());
                cert.setCertificateUrl(null);
            }
        }
        return certificateRepository.save(cert);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> downloadCertificateByHash(String uniqueHash) throws BusinessException, IOException {
        log.info("Yêu cầu tải chứng nhận với hash: {}", uniqueHash);

        Certificate cert = certificateRepository.findByUniqueHash(uniqueHash)
                .orElseThrow(() -> new BusinessException("Không tìm thấy chứng nhận với mã hash này."));

        String cloudinaryUrl = cert.getCertificateUrl();
        if (cloudinaryUrl == null || cloudinaryUrl.isBlank()) {
            throw new BusinessException("Chứng nhận này không có file đính kèm.");
        }

        log.info("Đang tải file từ Cloudinary URL: {}", cloudinaryUrl);

        try {
            byte[] fileContent = restTemplate.getForObject(cloudinaryUrl, byte[].class);

            if (fileContent == null) {
                throw new IOException("Không tải được nội dung file từ Cloudinary.");
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "certificate-" + uniqueHash + ".pdf");
            headers.setContentLength(fileContent.length);

            log.info("Tải file thành công, trả về {} bytes.", fileContent.length);
            return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);

        } catch (Exception e) {
            log.error("Lỗi khi tải file từ Cloudinary cho hash {}: {}", uniqueHash, e.getMessage(), e);
            throw new BusinessException("Không thể tải file chứng nhận. Vui lòng thử lại sau.");
        }
    }

    private byte[] generatePdfBytes(Certificate cert, String transactionId, String buyerUserId,
                                    BigDecimal creditAmount, String serialNumber) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            PdfFont font;
            PdfFont fontBold;

            try {
                ClassPathResource regularFont = new ClassPathResource("fonts/NotoSans-Italic-VariableFont_wdth,wght.ttf");
                ClassPathResource boldFont = new ClassPathResource("fonts/NotoSans-VariableFont_wdth,wght.ttf");
                byte[] regularBytes = regularFont.getInputStream().readAllBytes();
                byte[] boldBytes = boldFont.getInputStream().readAllBytes();
                font = PdfFontFactory.createFont(regularBytes, PdfEncodings.IDENTITY_H);
                fontBold = PdfFontFactory.createFont(boldBytes, PdfEncodings.IDENTITY_H);
                log.info("Font tiếng Việt loaded successfully");
            } catch (Exception e) {
                log.warn("Không load được font, dùng mặc định: {}", e.getMessage());
                font = PdfFontFactory.createFont(StandardFonts.HELVETICA);
                fontBold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            }
            document.setFont(font);


            try {
                ImageData imageData = ImageDataFactory.create(LOGO_URL);
                Image logo = new Image(imageData);
                logo.setWidth(80);
                logo.setFixedPosition(50, 750); // Vị trí góc trên bên trái
                document.add(logo);
            } catch (Exception e) {
                log.warn("Không tải được logo: {}", e.getMessage());
            }


            document.add(new Paragraph("\n"));

            Paragraph title = new Paragraph("GIẤY CHỨNG NHẬN")
                    .setFont(fontBold).setFontSize(24).setTextAlignment(TextAlignment.CENTER)
                    .setBold().setFontColor(ColorConstants.DARK_GRAY)
                    .setMarginTop(50);
            document.add(title);

            Paragraph subtitle = new Paragraph("BÙ ĐẮP CARBON")
                    .setFont(fontBold).setFontSize(20).setTextAlignment(TextAlignment.CENTER)
                    .setBold().setFontColor(new DeviceRgb(34, 139, 34));
            document.add(subtitle);


            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
            Table table = new Table(new float[]{200f, 300f});
            addTableRow(table, "Mã giao dịch:", transactionId, font, fontBold);
            addTableRow(table, "Người sở hữu:", buyerUserId, font, fontBold);
            addTableRow(table, "Số lượng tín chỉ:", creditAmount + " tCO₂", font, fontBold);
            addTableRow(table, "Ngày phát hành:", cert.getIssuedAt().format(formatter), font, fontBold);
            addTableRow(table, "Mã xác thực:", cert.getUniqueHash(), font, fontBold);
            addTableRow(table, "Số serial:", serialNumber, font, fontBold);
            document.add(table);


            document.add(new Paragraph("\n"));

            Table signatureTable = new Table(1);
            signatureTable.setWidth(UnitValue.createPercentValue(50)); // Chiếm 50% chiều rộng trang
            signatureTable.setHorizontalAlignment(HorizontalAlignment.RIGHT); // Đẩy bảng sang phải

            // Cell chứa chữ ký
            Cell issuerCell = new Cell()
                    .add(new Paragraph("Người đại diện")
                            .setFont(fontBold).setBold().setTextAlignment(TextAlignment.CENTER))
                    .add(new Paragraph("\n\n\n"))
                    .add(new Paragraph("_____________________")
                            .setTextAlignment(TextAlignment.CENTER))
                    .add(new Paragraph("Carbon Trading Company")
                            .setFont(font).setFontSize(10).setTextAlignment(TextAlignment.CENTER))
                    .setBorder(Border.NO_BORDER); // Bỏ viền

            signatureTable.addCell(issuerCell);
            document.add(signatureTable);

            Paragraph commitment = new Paragraph(

                    "Chứng nhận này xác nhận rằng người sở hữu đã đóng góp vào việc " +

                            "bảo vệ môi trường thông qua việc bù đắp lượng khí thải carbon tương ứng. " +

                            "Chứng nhận được phát hành bởi Carbon Trading Company và có giá trị pháp lý.")

                    .setFont(font)

                    .setFontSize(11)

                    .setTextAlignment(TextAlignment.JUSTIFIED)

                    .setItalic()

                    .setMarginTop(20)

                    .setMarginBottom(30)

                    .setFontColor(ColorConstants.DARK_GRAY);

            document.add(commitment);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Lỗi khi tạo PDF bytes cho cert hash {}: {}",
                    cert.getUniqueHash(), e.getMessage(), e);
            return null;
        }
    }

    private void addTableRow(Table table, String label, String value, PdfFont font, PdfFont fontBold) {
        Cell labelCell = new Cell()
                .add(new Paragraph(label)
                        .setFont(fontBold)
                        .setBold()
                        .setFontSize(11))
                .setBorder(Border.NO_BORDER)
                .setPaddingBottom(8);

        Cell valueCell = new Cell()
                .add(new Paragraph(value)
                        .setFont(font)
                        .setFontSize(11))
                .setBorder(Border.NO_BORDER)
                .setPaddingBottom(8);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void addTableRow(Table table, String label, String value) {
        Cell labelCell = new Cell()
                .add(new Paragraph(label)
                        .setBold()
                        .setFontSize(11))
                .setBorder(Border.NO_BORDER)
                .setPaddingBottom(8);

        Cell valueCell = new Cell()
                .add(new Paragraph(value)
                        .setFontSize(11))
                .setBorder(Border.NO_BORDER)
                .setPaddingBottom(8);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }
}