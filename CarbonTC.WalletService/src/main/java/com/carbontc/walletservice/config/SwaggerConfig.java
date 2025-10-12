package com.carbontc.walletservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI().info(new Info()
        .title("Carbon Credit Wallet Service API")
                .description("APIs for managing user wallets, deposits, and withdrawals").version("1.0"));
    };
}
