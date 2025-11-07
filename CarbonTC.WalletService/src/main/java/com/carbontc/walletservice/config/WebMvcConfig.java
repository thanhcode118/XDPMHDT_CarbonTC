package com.carbontc.walletservice.config;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Component
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {
    private final RequestLoggingInterceptor requestLoggingInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Thêm Interceptor vào
        registry.addInterceptor(requestLoggingInterceptor)

                // 1. Chỉ áp dụng cho các đường dẫn API
                .addPathPatterns("/api/**")

                // 2. Loại trừ các đường dẫn public/ồn ào
                .excludePathPatterns(
                        "/api/payments/vnpay-return", // Không log callback của VNPAY
                        "/api-docs/**",
                        "/swagger/**",
                        "/swagger-ui/**"
                );
    }
}
