package com.carbontc.walletservice.service.Impl;

import com.carbontc.walletservice.dto.request.EWalletRequest;
import com.carbontc.walletservice.dto.response.EWalletResponse;
import com.carbontc.walletservice.entity.EWallet;
import com.carbontc.walletservice.exception.BusinessException;
import com.carbontc.walletservice.repository.EWalletRepository;
import com.carbontc.walletservice.service.EWalletService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class EWalletServiceImpl implements EWalletService {

    private final EWalletRepository eWalletRepository;

    private final ModelMapper modelMapper;


    @Override
    public EWalletResponse createWallet(EWalletRequest request) throws BusinessException {

        EWallet eWallet = new EWallet();

        if(eWalletRepository.existsById(request.getUserId())){
            throw new BusinessException("Người dùng đã tạo ví rồi");
        }

        eWallet.setUserId(request.getUserId());
        eWallet.setCurrency(request.getCurrency());
        eWallet.setBalance(request.getAmount());
        eWallet.setUpdatedAt(LocalDateTime.now());
        EWallet saved = eWalletRepository.save(eWallet);

        return mapToResponse(saved);
    }

    @Override
    public EWalletResponse deposit(Long walletId, EWalletRequest request) {
        return null;
    }

    @Override
    public EWalletResponse withdraw(Long walletId, EWalletRequest request) {
        return null;
    }

    @Override
    public EWalletResponse getWalletById(Long walletId) {
        return null;
    }

    @Override
    public List<EWalletResponse> getAllWallets() {
        return List.of();
    }

    // HEPPLER METHOD MAPPER
    public EWalletResponse mapToResponse(EWallet eWallet) {
        return modelMapper.map(eWallet, EWalletResponse.class);
    }
}
