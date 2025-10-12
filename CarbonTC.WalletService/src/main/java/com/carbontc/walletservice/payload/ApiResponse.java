package com.carbontc.walletservice.payload;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
public class ApiResponse<T> {

    private Boolean success;
    private String message;
    private T data;
    private List<String> errors;
    private Instant timestamp =  Instant.now();

}
