package com.carbontc.walletservice.dto.request;

import com.carbontc.walletservice.entity.status.TransferType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreditTransferRequest {

    @NotNull(message = "ID người gửi không được trống")
    private Long fromUserId; // Sau này sẽ lấy từ token

    @NotNull(message = "ID người nhận không được trống")
    private Long toUserId;

    @NotNull(message = "Số lượng không được trống")
    @DecimalMin(value = "0.1", message = "Số lượng chuyển tối thiểu là 0.1")
    private BigDecimal amount; // Số lượng tín chỉ

    @NotNull(message = "Loại chuyển khoản không được trống")
    private TransferType transferType;

    private Long referenceId; // Tham chiếu tới giao dịch (nếu có)
}
