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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))// Tắt CSRF để test dễ hơn
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

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Đây chính là link bạn hỏi:
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));

        // Cho phép các phương thức này
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Cho phép các header này (quan trọng cho Auth)
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));

        // Cho phép gửi cookie/token
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Áp dụng cấu hình này cho TẤT CẢ các đường dẫn API
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
