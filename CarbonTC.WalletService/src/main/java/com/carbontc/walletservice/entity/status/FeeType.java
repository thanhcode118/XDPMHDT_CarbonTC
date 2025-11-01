package com.carbontc.walletservice.entity.status;

public enum FeeType {
    PENDING_WITHDRAWAL, // Phí đang chờ được rút
    WITHDRAWN           // Phí đã được rút (đã chuyển vào ví Admin)
}
