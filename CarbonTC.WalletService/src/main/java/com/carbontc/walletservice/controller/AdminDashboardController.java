package com.carbontc.walletservice.controller;

import com.carbontc.walletservice.dto.response.SystemOverviewResponse;
import com.carbontc.walletservice.dto.response.WithdrawRequestResponse;
import com.carbontc.walletservice.exception.BusinessException;
import com.carbontc.walletservice.payload.ApiResponse;
import com.carbontc.walletservice.service.AdminDashboardService;
import com.carbontc.walletservice.service.WithdrawRequestService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('Admin')")
public class AdminDashboardController {

    private final WithdrawRequestService withdrawRequestService;
    private final AdminDashboardService dashboardService;

    @Operation(summary = "Admin duyệt chấp nhận rút tiền")
    @PostMapping("/{requestId}/approve")
    public ResponseEntity<ApiResponse<WithdrawRequestResponse>> approveRequest(@PathVariable Long requestId) throws BusinessException {
        WithdrawRequestResponse response = withdrawRequestService.approveRequest(requestId);
        return ResponseEntity.ok(ApiResponse.success("Duyệt yêu cầu thành công, đã trừ tiền từ ví user.", response));
    }

    @Operation(summary = "Admin từ chối cho rút rút tiền")
    @PostMapping("/{requestId}/reject")
    public ResponseEntity<ApiResponse<WithdrawRequestResponse>> rejectRequest(@PathVariable Long requestId) throws BusinessException {
        WithdrawRequestResponse response = withdrawRequestService.rejectRequest(requestId);
        return ResponseEntity.ok(ApiResponse.success("Đã từ chối yêu cầu rút tiền.", response));
    }

    @Operation(summary = "Admin lấy danh sách yêu cầu rút tiền")
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<WithdrawRequestResponse>>> getPendingRequests() throws BusinessException {
        List<WithdrawRequestResponse> response = withdrawRequestService.getPendingRequests();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách yêu cầu rút tiền thành công.", response));
    }

    @Operation(summary = "[ADMIN] Lấy thống kê tổng quan hệ thống")
    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<SystemOverviewResponse>> getOverview() {
        SystemOverviewResponse overview = dashboardService.getSystemOverview();
        return ResponseEntity.ok(ApiResponse.success("Lấy thống kê tổng quan thành công", overview));
    }

    @Operation(summary = "[ADMIN] Lấy thống kê phí hoa hồng (doanh thu)")
    @GetMapping("/fees")
    public ResponseEntity<ApiResponse<BigDecimal>> getFeeStats(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        BigDecimal totalFees = dashboardService.getFeeStatistics(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Lấy thống kê phí thành công", totalFees));
    }
}
