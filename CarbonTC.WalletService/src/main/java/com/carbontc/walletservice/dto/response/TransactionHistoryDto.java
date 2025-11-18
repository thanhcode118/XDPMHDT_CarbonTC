package com.carbontc.walletservice.dto.response;

import com.carbontc.walletservice.entity.status.TransferStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@Data
@Builder
public class TransactionHistoryDto {
    private OffsetDateTime date;          // Cột "Thời gian" (15/05/2023)
    private String type;          // Cột "Loại" (Bán, Mua, Kiếm được)
    private BigDecimal amount;    // Cột "Số lượng tín chỉ" (20)
    private BigDecimal price;     // Cột "Giá trị (VNĐ)" (300.000)
    private BigDecimal co2Reduced; // Cột "CO2 giảm (kg)" (50)
    private TransferStatus status;
}
