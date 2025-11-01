package com.carbontc.walletservice.scheduler;

import com.carbontc.walletservice.repository.TransactionLogRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class TransactionCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(TransactionCleanupScheduler.class);
    private final TransactionLogRepository transactionLogRepository;

    /**
     * Chạy mỗi 30 phút để dọn dẹp các giao dịch VNPAY bị "treo".
     * (fixedRate = 1800000 ms = 30 phút)
     */
    @Scheduled(fixedRate = 1800000)
    @Transactional
    public void cleanupPendingTransactions() {
        log.info("--- Bắt đầu quét giao dịch PENDING quá hạn ---");

        // Tìm các giao dịch PENDING và tạo trước 30 phút
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(30);

        // (Bạn cần thêm hàm findByStatusAndCreatedAtBefore vào Repository)
        var pendingLogs = transactionLogRepository.findByStatusAndCreatedAtBefore("PENDING", cutoff);

        if (pendingLogs.isEmpty()) {
            log.info("Không tìm thấy giao dịch nào quá hạn.");
            return;
        }

        for (var logEntry : pendingLogs) {
            log.warn("Hủy giao dịch PENDING quá hạn: {}", logEntry.getId());
            logEntry.setStatus("EXPIRED");
            logEntry.setDescription("Giao dịch bị hủy do quá hạn thanh toán");
            transactionLogRepository.save(logEntry);
        }

        log.info("--- Quét giao dịch PENDING hoàn tất. Đã hủy {} giao dịch. ---", pendingLogs.size());
    }
}