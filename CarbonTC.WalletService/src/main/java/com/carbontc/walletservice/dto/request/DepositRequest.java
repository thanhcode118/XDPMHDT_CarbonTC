package com.carbontc.walletservice.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class DepositRequest {


    @NotNull(message = "Số tiền không được để trống")
    @DecimalMin(value = "10000", message = "Số tiền nạp tối thiểu là 10,000 VND")
    private BigDecimal amount;
}