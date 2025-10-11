package com.carbontc.walletservice.repository;
import com.carbontc.walletservice.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
}
