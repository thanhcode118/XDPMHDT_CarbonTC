package com.carbontc.walletservice.service.Impl;

import com.carbontc.walletservice.config.RestTemplateConfig;
import com.carbontc.walletservice.dto.request.CanWithdrawRequest;
import com.carbontc.walletservice.dto.request.CreateWithdrawRequest;
import com.carbontc.walletservice.dto.response.CanWithdrawResponse;
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
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WithdrawRequestServiceImpl implements WithdrawRequestService {

    private final EWalletRepository eWalletRepository;

    private final WithdrawRequestRepository withdrawRequestRepository;

    private final ModelMapper modelMapper;

    private final EWalletService eWalletService;

    private final RestTemplate resTemplate;

    @Value("${listing.service.url}")
    private String listingServiceUrl;

    @Override
    @Transactional
    public WithdrawRequestResponse createRequest(CreateWithdrawRequest request) throws BusinessException {
        EWallet eWallet = eWalletRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví của khách hàng"));

        log.info("Bắt đầu gọi ListingService để kiểm tra quyền rút tiền cho user: {}", request.getUserId());
        String checkUrl = listingServiceUrl + "/api/Listing/canwithdraw";
        CanWithdrawRequest apiRequest = new CanWithdrawRequest(request.getUserId(), request.getAmount());

        try {
            CanWithdrawResponse apiResponse = resTemplate.postForObject(checkUrl, apiRequest, CanWithdrawResponse.class);

            // Kiểm tra kết quả trả về
            if (apiResponse == null || !apiResponse.isSuccess() || !apiResponse.isData()) {
                log.warn("User {} bị từ chối rút tiền bởi ListingService", request.getUserId());
                throw new BusinessException("Không thể tạo yêu cầu rút tiền. Tiền của bạn có thể đang bị khoá trong một giao dịch.");
            }

            log.info("ListingService đã cho phép user {} rút tiền.", request.getUserId());

        } catch (Exception e) {
            log.error("Lỗi khi gọi ListingService: {}", e.getMessage());
            throw new BusinessException("Lỗi hệ thống khi kiểm tra quyền rút tiền.");
        }

        if (eWallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BusinessException("Số dư của quý khách không đủ thực hiện giao dịch");
        }

        eWallet = eWalletRepository.save(eWallet);

        log.info("Test log ewallet {}", eWallet);
        System.out.println(eWallet + "test Log ewallet");


        WithdrawRequest withdrawRequest = new WithdrawRequest();
        withdrawRequest.setUserId(request.getUserId());
        withdrawRequest.setWallet(eWallet);
        withdrawRequest.setAmount(request.getAmount());
        withdrawRequest.setBankAccountNumber(request.getBankAccountNumber());
        withdrawRequest.setBankName(request.getBankName());
        withdrawRequest.setStatus(WithdrawStatus.PENDING); // Trạng thái chờ duyệt
        withdrawRequest.setRequestedAt(LocalDateTime.now());

        // Thiết lập quan hệ 2 chiều
        if (eWallet.getWithdrawRequests() == null) {
            eWallet.setWithdrawRequests(new ArrayList<>());
        }
        eWallet.getWithdrawRequests().add(withdrawRequest);

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

        eWalletService.withdraw(request.getWallet().getWalletId(), request.getAmount());
        request.setStatus(WithdrawStatus.APPROVED);
        request.setProcessedAt(LocalDateTime.now());
        WithdrawRequest updatedRequest = withdrawRequestRepository.save(request);
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
        WithdrawRequestResponse response = modelMapper.map(withdrawRequest, WithdrawRequestResponse.class);

        // Fix null pointer bằng cách map manually
        if (withdrawRequest.getWallet() != null) {
            response.setWalletId(withdrawRequest.getWallet().getWalletId());
        }

        return response;
    }
}
