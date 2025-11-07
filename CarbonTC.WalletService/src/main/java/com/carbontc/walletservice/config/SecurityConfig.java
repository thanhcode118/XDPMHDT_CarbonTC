package com.carbontc.walletservice.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Tắt CSRF để test dễ hơn
                .authorizeHttpRequests(auth -> auth
                        // Cho phép public các endpoint này
                        .requestMatchers(
                                "/swagger/**",
                                "/webjars/**",
                                "/swagger-ui/**",    // Đường dẫn thật (cho redirect)
                                "/swagger-resources/**",
                                "/v3/api-docs/**",
                                "/api-docs/**",
                                "/api/payments/vnpay-return" // Chỉ VNPAY callback
                        ).permitAll()
                        .requestMatchers("/api/admin/**").hasRole("Admin")                        // Các API khác vẫn cần xác thực
                        .anyRequest().authenticated()
                ).sessionManagement(sessionManagement ->sessionManagement
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
