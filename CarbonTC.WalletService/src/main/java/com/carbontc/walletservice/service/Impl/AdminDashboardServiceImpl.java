package com.carbontc.walletservice.service.Impl;

import com.carbontc.walletservice.dto.response.SystemOverviewResponse;
import com.carbontc.walletservice.entity.status.FeeType;
import com.carbontc.walletservice.repository.CarbonWalletsRepository;
import com.carbontc.walletservice.repository.EWalletRepository;
import com.carbontc.walletservice.repository.TransactionFeeRepository;
import com.carbontc.walletservice.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final EWalletRepository eWalletRepository;
    private final CarbonWalletsRepository carbonWalletsRepository;
    private final TransactionFeeRepository transactionFeeRepository;

    @Override
    @Transactional(readOnly = true)
    public SystemOverviewResponse getSystemOverview() {
        long totalEWallets = eWalletRepository.count();
        long totalCarbonWallets = carbonWalletsRepository.count();

        BigDecimal totalMoney = eWalletRepository.getTotalBalance();
        BigDecimal totalCarbon = carbonWalletsRepository.getTotalBalance();

        return SystemOverviewResponse.builder()
                .totalEWallets(totalEWallets)
                .totalCarbonWallets(totalCarbonWallets)
                .totalMoneyBalance(totalMoney != null ? totalMoney : BigDecimal.ZERO)
                .totalCarbonBalance(totalCarbon != null ? totalCarbon : BigDecimal.ZERO)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getFeeStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        BigDecimal totalFees = transactionFeeRepository.sumFeesByDateRange(
                FeeType.PLATFORM_FEE, startDate, endDate
        );
        return totalFees != null ? totalFees : BigDecimal.ZERO;
    }
}
