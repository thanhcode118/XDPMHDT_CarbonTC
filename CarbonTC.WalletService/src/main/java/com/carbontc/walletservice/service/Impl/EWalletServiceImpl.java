package com.carbontc.walletservice.service.Impl;

import com.carbontc.walletservice.dto.request.EWalletRequest;
import com.carbontc.walletservice.dto.response.EWalletResponse;
import com.carbontc.walletservice.dto.response.TransactionLogResponse;
import com.carbontc.walletservice.entity.EWallet;
import com.carbontc.walletservice.entity.TransactionLog;
import com.carbontc.walletservice.exception.BusinessException;
import com.carbontc.walletservice.repository.EWalletRepository;
import com.carbontc.walletservice.repository.TransactionLogRepository;
import com.carbontc.walletservice.service.EWalletService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EWalletServiceImpl implements EWalletService {

    private final EWalletRepository eWalletRepository;

    private final ModelMapper modelMapper;

    private final TransactionLogRepository transactionLogRepository;


    // TẠO VÍ
    @Override
    public EWalletResponse createWallet(String userId, EWalletRequest request) throws BusinessException {
        EWallet eWallet = new EWallet();

        if(eWalletRepository.existsByUserId(userId)){
            throw new BusinessException("Người dùng đã tạo ví rồi");
        }

        eWallet.setUserId(userId);
        eWallet.setCurrency(request.getCurrency());
        eWallet.setBalance(BigDecimal.ZERO);
        eWallet.setUpdatedAt(LocalDateTime.now());

        EWallet saved = eWalletRepository.save(eWallet);
        return mapToResponse(saved);
    }

    // NỘP TIỀN
    @Override
    @Transactional(rollbackFor = BusinessException.class)
    public EWalletResponse deposit(Long walletId, BigDecimal amount) throws BusinessException {
        EWallet eWallet = eWalletRepository.findById(walletId)
                .orElseThrow(() -> new BusinessException("Ví không tồn tại"));

        if (amount.compareTo(BigDecimal.valueOf(5000)) < 0) {
            throw new BusinessException("Số tiền nạp phải lớn hơn 5.000 VND");
        }

        eWallet.setBalance(eWallet.getBalance().add(amount));
        eWallet.setUpdatedAt(LocalDateTime.now());

        EWallet eWalletSaved = eWalletRepository.save(eWallet);
        TransactionLog log = new TransactionLog();
        log.setWallet(eWalletSaved);
        log.setAmount(amount);
        log.setType("DEPOSIT");
        log.setStatus("SUCCESS");
        log.setDescription("Nạp tiền thành công vào ví ID: " + walletId);
        transactionLogRepository.save(log);
        return mapToResponse(eWalletSaved);
    }


    @Override
    @Transactional(rollbackFor = BusinessException.class)
    public EWalletResponse withdraw(Long walletId, BigDecimal amount ) throws BusinessException {

        EWallet eWallet = eWalletRepository.findById(walletId)
                .orElseThrow(() -> new BusinessException("Ví không tồn tại"));

        if (amount.compareTo(BigDecimal.valueOf(10000)) < 0) {
            throw new BusinessException("Số tiền rút phải lớn hơn 10.000 VND");
        }


        if (eWallet.getBalance().compareTo(amount) < 0) {
            throw new BusinessException("Số dư không đủ để thực hiện giao dịch. Vui lòng nạp thêm tiền.");
        }


        eWallet.setBalance(eWallet.getBalance().subtract(amount));
        eWallet.setUpdatedAt(LocalDateTime.now());

        EWallet eWalletSaved = eWalletRepository.save(eWallet);

        TransactionLog log = new TransactionLog();
        log.setWallet(eWalletSaved);
        log.setAmount(amount);
        log.setType("WITHDRAW");
        log.setStatus("SUCCESS");
        log.setDescription("Rút tiền thành công khỏi ví ID: " + walletId);
        transactionLogRepository.save(log);

        return mapToResponse(eWalletSaved);
    }

    @Override
    public EWalletResponse getMyWalletByUserId(String userId) throws BusinessException {
        EWallet eWallet = findWalletByUserId(userId);
        return mapToResponse(eWallet);
    }

    @Override
    public EWallet findWalletByUserId(String userId) throws BusinessException {
        return eWalletRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy ví người dùng"));
    }

    @Override
    public List<TransactionLogResponse> getTransactionHistoryByUserId(String userId) throws BusinessException {
       EWallet eWallet = findWalletByUserId(userId);

        Long walletId = eWallet.getWalletId();

        // 2. Tìm log bằng walletId (Long)
        List<TransactionLog> logs = transactionLogRepository.findByWallet_WalletIdOrderByCreatedAtDesc(walletId);

        return logs.stream()
                .map(log -> modelMapper.map(log, TransactionLogResponse.class))
                .toList();
    }

    // HEPPLER METHOD MAPPER
    public EWalletResponse mapToResponse(EWallet eWallet) {
        return modelMapper.map(eWallet, EWalletResponse.class);
    }
}
