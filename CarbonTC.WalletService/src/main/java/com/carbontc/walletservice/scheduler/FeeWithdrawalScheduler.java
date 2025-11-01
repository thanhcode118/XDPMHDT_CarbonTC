package com.carbontc.walletservice.scheduler;

import com.carbontc.walletservice.service.TransactionFeeService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class FeeWithdrawalScheduler {

    private static final Logger log = LoggerFactory.getLogger(FeeWithdrawalScheduler.class);

    private final TransactionFeeService transactionFeeService;

    @Value("${wallet-config.admin-user-id}")
    private String ADMIN_USER_ID;

    /**
     * Chạy vào 1 giờ sáng mỗi ngày.
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void processFeeWithdrawal() {
        log.info("--- [SCHEDULER] Bắt đầu chạy tác vụ rút phí hoa hồng ---");
        try {
            BigDecimal totalWithdrawn = transactionFeeService.withdrawPendingFeeToAdmin(ADMIN_USER_ID);

            if (totalWithdrawn.compareTo(BigDecimal.ZERO) > 0) {
                log.info("--- [SCHEDULER] Đã rút thành công: {} VND ---", totalWithdrawn);
            } else {
                log.info("--- [SCHEDULER] Không có phí nào để rút ---");
            }

        } catch (Exception e) {
            log.error("--- [SCHEDULER] Lỗi nghiêm trọng khi đang rút phí: {}", e.getMessage(), e);
        }
    }
}
