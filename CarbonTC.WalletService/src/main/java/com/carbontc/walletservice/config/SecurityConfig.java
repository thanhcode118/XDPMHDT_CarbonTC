package com.carbontc.walletservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Tắt CSRF để test dễ hơn
                .authorizeHttpRequests(auth -> auth
                        // Cho phép public các endpoint này
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/api-docs/**",
                                "/api/wallet/**",
                                "/api/payments/**",  // Cho phép test VNPay API
                                "/api/wallet/**"
                        ).permitAll()
                        // Các API khác vẫn cần xác thực
                        .anyRequest().authenticated()
                );
        return http.build();
    }
}
