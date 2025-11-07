package com.carbontc.walletservice.config;

import com.carbontc.walletservice.dto.response.WithdrawRequestResponse;
import com.carbontc.walletservice.entity.WithdrawRequest;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();

        // Tắt auto-mapping ambiguous để tránh conflict
        modelMapper.getConfiguration()
                .setAmbiguityIgnored(true)
                .setMatchingStrategy(MatchingStrategies.STRICT);

        // Cấu hình mapping rõ ràng cho WithdrawRequest -> WithdrawRequestResponse
        modelMapper.typeMap(WithdrawRequest.class, WithdrawRequestResponse.class)
                .addMappings(mapper -> {
                    mapper.map(src -> src.getWallet().getWalletId(),
                            WithdrawRequestResponse::setWalletId);
                });

        return modelMapper;
    }
}
