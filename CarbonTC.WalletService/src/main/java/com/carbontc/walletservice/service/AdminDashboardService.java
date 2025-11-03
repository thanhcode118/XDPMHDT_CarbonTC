package com.carbontc.walletservice.service;

import com.carbontc.walletservice.dto.response.SystemOverviewResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface AdminDashboardService {
    public SystemOverviewResponse getSystemOverview();
    public BigDecimal getFeeStatistics(LocalDateTime startDate, LocalDateTime endDate);
}
