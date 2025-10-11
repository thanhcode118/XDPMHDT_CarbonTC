package com.carbontc.walletservice.repository;
import com.carbontc.walletservice.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {
}
