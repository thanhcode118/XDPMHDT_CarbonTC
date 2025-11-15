package com.carbontc.walletservice.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class CanWithdrawResponse {
    private boolean success;
    private String message;
    private boolean data; // Quan trọng nhất: true hoặc false
    private List<String> errors;
}
