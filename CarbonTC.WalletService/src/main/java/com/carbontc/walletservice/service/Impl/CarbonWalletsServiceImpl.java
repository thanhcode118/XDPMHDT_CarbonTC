package com.carbontc.walletservice.service.Impl;

import com.carbontc.walletservice.dto.event.CreditIssuedEvent;
import com.carbontc.walletservice.dto.request.CreditTransferRequestForConsumer;
import com.carbontc.walletservice.dto.response.CarbonWalletResponse;
import com.carbontc.walletservice.dto.response.CreditTransferResponse;
import com.carbontc.walletservice.dto.response.TransactionHistoryDto;
import com.carbontc.walletservice.entity.CarbonCreditTransfer;
import com.carbontc.walletservice.entity.CarbonWallets;
import com.carbontc.walletservice.entity.status.TransferStatus;
import com.carbontc.walletservice.entity.status.TransferType;
import com.carbontc.walletservice.exception.BusinessException;
import com.carbontc.walletservice.repository.CarbonCreditTransferRepository;
import com.carbontc.walletservice.repository.CarbonWalletsRepository;
import com.carbontc.walletservice.service.CarbonWalletsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CarbonWalletsServiceImpl implements CarbonWalletsService {

   private final ModelMapper modelMapper;

   private final CarbonWalletsRepository carbonWalletsRepository;

   private final CarbonCreditTransferRepository carbonCreditTransferRepository;

    @Override
    public CarbonWalletResponse createCarbonWallet(String userId) throws BusinessException {
        if(carbonWalletsRepository.existsByOwnerId(userId)){
            throw new BusinessException("Ví carbon của dùng đã tồn tại");
        }

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
    @Transactional
    public CarbonWalletResponse getCarbonWalletByUserId(String userId) throws BusinessException {
        CarbonWallets carbonWallets = carbonWalletsRepository.findByOwnerId(userId)
                .orElseThrow(()-> new BusinessException(" Không tìm thấy ví Carbon người dùng"));
        return mapToWalletResponse(carbonWallets);
    }

    @Override
    @Transactional
    public CarbonWallets findWalletByOwnerId(String userId) throws BusinessException {
        return carbonWalletsRepository.findByOwnerId(userId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy ví Carbon của người dùng: " + userId));
    }

    @Override
    public void issueNewCredits(CreditIssuedEvent event) throws BusinessException {
        CarbonWallets wallets = findWalletByOwnerId(event.getOwnerUserId());

        wallets.setBalance(wallets.getBalance().add(event.getCreditAmount()));
        wallets.setTotalEarned(wallets.getTotalEarned().add(event.getCreditAmount()));
        wallets.setLastUpdated(LocalDateTime.now());
        carbonWalletsRepository.save(wallets);

        //LOG GIAO DỊCH
        CarbonCreditTransfer log = new CarbonCreditTransfer();
        log.setFromWallet(null); // <-- Không ai gửi cả
        log.setToWallet(wallets); // Gửi cho user này
        log.setAmount(event.getCreditAmount());
        log.setTransferType(TransferType.ISSUE); // <-- Loại giao dịch là "Phát hành"
        log.setReferenceId(event.getReferenceId());
        log.setCreatedAt(event.getIssuedAt());

        carbonCreditTransferRepository.save(log);
    }

    @Override
    @Transactional(readOnly = true)
    public CreditTransferResponse transferCredits(String fromUserId, CreditTransferRequestForConsumer request) throws BusinessException {

        CarbonWallets senderWallet = carbonWalletsRepository.findByOwnerId(fromUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy ví người gửi."));

        CarbonWallets receiverWallet = carbonWalletsRepository.findByOwnerId(request.getToUserId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy ví người nhận."));

        if (senderWallet.getBalance().compareTo(request.getAmount()) < 0) {
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
        carbonCreditTransfer.setToWallet(receiverWallet);
        carbonCreditTransfer.setAmount(request.getAmount());
        carbonCreditTransfer.setTransferType(request.getTransferType());
        carbonCreditTransfer.setReferenceId(request.getReferenceId());
        carbonCreditTransfer.setTotalPrice(request.getTotalPrice());
        if (request.getStatus() != null) {
            carbonCreditTransfer.setStatus(request.getStatus());
        } else {
            carbonCreditTransfer.setStatus(TransferStatus.COMPLETED);
        }

        carbonCreditTransfer.setCreatedAt(LocalDateTime.now());

        CarbonCreditTransfer saved = carbonCreditTransferRepository.save(carbonCreditTransfer);

        return mapToTransferResponse(saved);
    }

    @Override
    public List<TransactionHistoryDto> getTransactionHistory(String currentUserId) { // ID người đang xem

        List<CarbonCreditTransfer> rawData = carbonCreditTransferRepository.findAllHistoryByUserId(currentUserId);

        return rawData.stream().map(t -> {

            // --- LOGIC QUYẾT ĐỊNH "LOẠI" ---
            String calculatedType;

            if (t.getTransferType() == TransferType.ISSUE) {
                calculatedType = "EARN"; // Kiếm được
            } else {
                // Kiểm tra xem người đang xem (currentUserId) là người gửi hay người nhận
                if (t.getFromWallet().getOwnerId().equals(currentUserId)) {
                    calculatedType = "SELL"; // Mình là người gửi -> Tức là mình Bán
                } else {
                    calculatedType = "BUY";  // Mình là người nhận -> Tức là mình Mua
                }
            }

            return TransactionHistoryDto.builder()
                    .date(t.getCreatedAt())
                    .type(calculatedType)
                    .amount(t.getAmount())
                    .price(t.getTotalPrice())
                    .co2Reduced(t.getAmount().multiply(BigDecimal.valueOf(1000)))
                    .status(t.getStatus())
                    .build();

        }).toList();
    }

    // HELPER METHOD MAP
    private CarbonWalletResponse mapToWalletResponse(CarbonWallets carbonWallet) {
        return modelMapper.map(carbonWallet, CarbonWalletResponse.class);
    }

    private CreditTransferResponse mapToTransferResponse(CarbonCreditTransfer transfer) {
        if (transfer == null) {
            return null;
        }

        CreditTransferResponse response = CreditTransferResponse.builder()
                .transferId(transfer.getTransferId())
                        .amount(transfer.getAmount())
                                .transferType(transfer.getTransferType())
                                        .referenceId(transfer.getReferenceId())
                                                .createdAt(transfer.getCreatedAt())
                                                        .build();

        // Map các trường phức tạp (kiểm tra null)
        if (transfer.getFromWallet() != null) {
            response.setFromWalletId(transfer.getFromWallet().getWalletId());
        } else {
            response.setFromWalletId(null); // Hoặc giá trị mặc định nếu cần
        }

        if (transfer.getToWallet() != null) {
            response.setToWalletId(transfer.getToWallet().getWalletId());
        } else {
            response.setToWalletId(null);
        }

        return response;
    }
}
