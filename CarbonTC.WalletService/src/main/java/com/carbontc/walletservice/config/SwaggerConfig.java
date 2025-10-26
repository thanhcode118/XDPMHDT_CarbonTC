package com.carbontc.walletservice.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        security = {
                @SecurityRequirement(name = "bearerAuth") // Áp dụng bảo mật 'bearerAuth' cho TẤT CẢ API
        }
)
@SecurityScheme(
        name = "bearerAuth", // Tên của scheme bảo mật
        description = "Nhập JWT Token của bạn (với tiền tố 'Bearer ')",
        scheme = "bearer",
        type = SecuritySchemeType.HTTP, // Loại: HTTP
        in = SecuritySchemeIn.HEADER,
        bearerFormat = "JWT"
)public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI().info(new Info()
        .title("Carbon Credit Wallet Service API")
                .description("APIs for managing user wallets, deposits, and withdrawals").version("1.0"));
    };




}
