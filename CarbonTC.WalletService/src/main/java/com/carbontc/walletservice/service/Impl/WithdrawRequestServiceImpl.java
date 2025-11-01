package com.carbontc.walletservice.service.Impl;

import com.carbontc.walletservice.dto.request.CreateWithdrawRequest;
import com.carbontc.walletservice.dto.response.WithdrawRequestResponse;
import com.carbontc.walletservice.entity.EWallet;
import com.carbontc.walletservice.entity.WithdrawRequest;
import com.carbontc.walletservice.entity.status.WithdrawStatus;
import com.carbontc.walletservice.exception.BusinessException;
import com.carbontc.walletservice.repository.EWalletRepository;
import com.carbontc.walletservice.repository.WithdrawRequestRepository;
import com.carbontc.walletservice.service.EWalletService;
import com.carbontc.walletservice.service.WithdrawRequestService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WithdrawRequestServiceImpl implements WithdrawRequestService {

    private final EWalletRepository eWalletRepository;

    private final WithdrawRequestRepository withdrawRequestRepository;

    private final ModelMapper modelMapper;

    private final EWalletService eWalletService;

    @Override
    @Transactional
    public WithdrawRequestResponse createRequest(CreateWithdrawRequest request) throws BusinessException {
        EWallet eWallet = eWalletRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví của khách hàng"));

        if (eWallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BusinessException("Số dư của quý khách không đủ thực hiện giao dịch");
        }

        WithdrawRequest withdrawRequest = new WithdrawRequest();
        withdrawRequest.setUserId(request.getUserId());
        withdrawRequest.setAmount(request.getAmount());
        withdrawRequest.setBankAccountNumber(request.getBankAccountNumber());
        withdrawRequest.setBankName(request.getBankName());
        withdrawRequest.setStatus(WithdrawStatus.PENDING); // Trạng thái chờ duyệt
        withdrawRequest.setRequestedAt(LocalDateTime.now());

        WithdrawRequest saved = withdrawRequestRepository.save(withdrawRequest);
        try {
            return mapToRespone(saved);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    @Transactional
    public WithdrawRequestResponse approveRequest(Long requestId) throws BusinessException {
        WithdrawRequest request = withdrawRequestRepository.findById(requestId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy yêu cầu rút tiền."));

        if (request.getStatus() != WithdrawStatus.PENDING) {
            throw new BusinessException("Yêu cầu này đã được xử lý trước đó.");
        }

        request.setStatus(WithdrawStatus.REJECTED);
        request.setProcessedAt(LocalDateTime.now());
        WithdrawRequest updatedRequest = withdrawRequestRepository.save(request);
        eWalletService.withdraw(request.getUserId(), request.getAmount());

        return mapToRespone(updatedRequest);
    }

    @Override
    @Transactional
    public WithdrawRequestResponse rejectRequest(Long requestId) throws BusinessException{
            WithdrawRequest request = withdrawRequestRepository.findById(requestId)
                    .orElseThrow(() -> new BusinessException("Không tìm thấy yêu cầu rút tiền."));

            if (request.getStatus() != WithdrawStatus.PENDING) {
                throw new BusinessException("Yêu cầu này đã được xử lý trước đó.");
            }

            request.setStatus(WithdrawStatus.REJECTED);
            request.setProcessedAt(LocalDateTime.now());
            WithdrawRequest updatedRequest = withdrawRequestRepository.save(request);

            return mapToRespone(updatedRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WithdrawRequestResponse> getPendingRequests() throws BusinessException {

        List<WithdrawRequest> withdrawRequests = withdrawRequestRepository.findWithdrawRequestByStatus(WithdrawStatus.PENDING);

        return withdrawRequests.stream()
                .map(this::mapToRespone)
                .collect(Collectors.toList());
    }

    //HEPLER MAPPER
    public WithdrawRequestResponse mapToRespone(WithdrawRequest withdrawRequest){
        return modelMapper.map(withdrawRequest, WithdrawRequestResponse.class);
    }
}
