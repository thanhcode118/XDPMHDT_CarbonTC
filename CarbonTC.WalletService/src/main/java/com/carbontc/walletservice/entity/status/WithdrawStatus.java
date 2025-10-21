package com.carbontc.walletservice.entity.status;

public enum WithdrawStatus {
    /**
     * Yêu cầu đang chờ được xử lý.
     */
    PENDING,

    /**
     * Yêu cầu đã được chấp thuận và tiền đã được xử lý.
     */
    APPROVED,

    /**
     * Yêu cầu đã bị từ chối.
     */
    REJECTED,

    /**
     * Yêu cầu đã được thanh toán cho người dùng (trạng thái cuối cùng sau APPROVED).
     */
    PAID,

    /**
     * Yêu cầu đã thất bại trong quá trình xử lý thanh toán.
     */
    FAILED
}
