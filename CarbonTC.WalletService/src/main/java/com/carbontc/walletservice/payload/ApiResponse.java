package com.carbontc.walletservice.payload;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class ApiResponse<T> {

    private Boolean success;
    private String message;
    private T data;
    private List<String> errors;
    private Instant timestamp =  Instant.now();

    // 👇 Static helper methods
    public static <T> ApiResponse<T> success(String message, T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = true;
        response.message = message;
        response.data = data;
        return response;
    }

    public static <T> ApiResponse<T> fail(String message, List<String> errors) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = false;
        response.message = message;
        response.errors = errors;
        return response;
    }

    // Overload nếu chỉ có 1 lỗi
    public static <T> ApiResponse<T> fail(String message, String error) {
        return fail(message, List.of(error));
    }
}
