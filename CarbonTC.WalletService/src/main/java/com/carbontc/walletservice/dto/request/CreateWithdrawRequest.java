package com.carbontc.walletservice.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateWithdrawRequest {

    @NotNull(message = "User ID không được để trống")
    private String userId;

    @NotNull(message = "Số tiền không được để trống")
    @DecimalMin(value = "10000.0", message = "Số tiền rút tối thiểu là 10,000")
    private BigDecimal amount;

    @NotBlank(message = "Số tài khoản ngân hàng không được để trống")
    private String bankAccountNumber;

    @NotBlank(message = "Tên ngân hàng không được để trống")
    private String bankName;
}
