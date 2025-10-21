package com.carbontc.walletservice.service.Impl;

import com.carbontc.walletservice.dto.request.CreditTransferRequest;
import com.carbontc.walletservice.dto.response.CarbonWalletResponse;
import com.carbontc.walletservice.dto.response.CreditTransferResponse;
import com.carbontc.walletservice.entity.CarbonCreditTransfer;
import com.carbontc.walletservice.entity.CarbonWallets;
import com.carbontc.walletservice.exception.BusinessException;
import com.carbontc.walletservice.repository.CarbonCreditTransferRepository;
import com.carbontc.walletservice.repository.CarbonWalletsRepository;
import com.carbontc.walletservice.service.CarbonWalletsService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CarbonWalletsServiceImpl implements CarbonWalletsService {

   private final ModelMapper modelMapper;

   private final CarbonWalletsRepository carbonWalletsRepository;

   private final CarbonCreditTransferRepository carbonCreditTransferRepository;

    @Override
    public CarbonWalletResponse createCarbonWallet(Long userId) throws BusinessException {
        if(carbonWalletsRepository.existsByOwnerId(userId)){
            throw new BusinessException("Ví carbon của dùng đã tồn tại");
        };

        CarbonWallets newWallet = new CarbonWallets();
        newWallet.setOwnerId(userId);
        newWallet.setBalance(BigDecimal.ZERO);
        newWallet.setTotalEarned(BigDecimal.ZERO);
        newWallet.setLastUpdated(LocalDateTime.now());
        carbonWalletsRepository.save(newWallet);

        CarbonWallets saved =  carbonWalletsRepository.save(newWallet);
        return mapToWalletResponse(saved);
    }

    @Override
    public CarbonWalletResponse getCarbonWalletByUserId(Long userId) throws BusinessException {
        CarbonWallets carbonWallets = carbonWalletsRepository.findByOwnerId(userId)
                .orElseThrow(()-> new BusinessException(" Không tìm thấy ví người dùng"));
        return mapToWalletResponse(carbonWallets);
    }

    @Override
    @Transactional(rollbackOn = Exception.class)
    public CreditTransferResponse transferCredits(CreditTransferRequest request) throws BusinessException {
        CarbonWallets senderWallet = carbonWalletsRepository.findByOwnerId(request.getFromUserId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy ví người gửi."));

        CarbonWallets receiverWallet = carbonWalletsRepository.findByOwnerId(request.getToUserId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy ví người nhận."));

        // kiểm tra số dư
        if (senderWallet.getBalance().compareTo(request.getAmount()) < 0) { // So sánh với request.getAmount()
            throw new BusinessException("Số dư tín chỉ không đủ giao dịch.");
        }

        senderWallet.setBalance(senderWallet.getBalance().subtract(request.getAmount()));
        senderWallet.setLastUpdated(LocalDateTime.now());
        carbonWalletsRepository.save(senderWallet);

        receiverWallet.setBalance(receiverWallet.getBalance().add(request.getAmount()));
        receiverWallet.setLastUpdated(LocalDateTime.now());
        carbonWalletsRepository.save(receiverWallet);

        CarbonCreditTransfer carbonCreditTransfer = new CarbonCreditTransfer();
        carbonCreditTransfer.setFromWallet(senderWallet);
        carbonCreditTransfer.setToWallet(receiverWallet); // Sửa tên phương thức
        carbonCreditTransfer.setAmount(request.getAmount());
        carbonCreditTransfer.setTransferType(request.getTransferType());
        carbonCreditTransfer.setReferenceId(request.getReferenceId()); // Thêm dòng này
        carbonCreditTransfer.setCreatedAt(LocalDateTime.now());

        CarbonCreditTransfer saved = carbonCreditTransferRepository.save(carbonCreditTransfer);


        return mapToTransferResponse(saved);
    }

    // HELPER METHOD MAP
    private CarbonWalletResponse mapToWalletResponse(CarbonWallets carbonWallet) {
        return modelMapper.map(carbonWallet, CarbonWalletResponse.class);
    }

    private CreditTransferResponse mapToTransferResponse(CarbonCreditTransfer creditTransfer ) {
        return modelMapper.map(creditTransfer, CreditTransferResponse.class);
    }
}
