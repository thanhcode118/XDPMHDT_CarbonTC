package com.carbontc.walletservice.entity.status;

public enum TransferType {
    /**
     * Giao dịch mua/bán tín chỉ qua sàn Marketplace.
     */
    SALE,

    /**
     * Người dùng tự nguyện tặng tín chỉ cho người khác.
     */
    GIFT,

    /**
     * Admin điều chỉnh số dư (cộng/trừ) vì lý do hệ thống.
     */
    ADJUSTMENT,

    /**
     * Hoàn trả tín chỉ do một giao dịch SALE bị hủy.
     */
    REFUND,

    /**
     * Tín chỉ được phát hành lần đầu (từ Carbon Lifecycle Service).
     */
    ISSUE
}
