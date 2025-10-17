package com.carbontc.walletservice.service.Impl;

import com.carbontc.walletservice.config.VNPayConfig;
import com.carbontc.walletservice.service.VNPayService;
import com.carbontc.walletservice.util.VNPayUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VNPayServiceImpl implements VNPayService {

    private final VNPayConfig vnPayConfig;

    @Override
    public String createPaymentUrl(String vnp_TxnRef, BigDecimal amount, String orderInfo, String ipAddr) throws Exception {
        Map<String, String> vnp_Params = new HashMap<>();

        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getTmnCode());

        long amountAsLong = amount.multiply(new BigDecimal("100")).longValue();
        vnp_Params.put("vnp_Amount", String.valueOf(amountAsLong));

        vnp_Params.put("vnp_CurrCode", "VND");

        // Kết hợp TxnRef gốc với timestamp để đảm bảo tính duy nhất tuyệt đối
        String final_vnp_TxnRef = vnp_TxnRef + "_" + System.currentTimeMillis();
        vnp_Params.put("vnp_TxnRef", final_vnp_TxnRef);

        vnp_Params.put("vnp_OrderInfo", orderInfo);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());

        vnp_Params.put("vnp_IpAddr", "13.160.92.202");

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);


        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayUtil.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        String paymentUrl = vnPayConfig.getPayUrl() + "?" + queryUrl + "&vnp_SecureHash=" + vnp_SecureHash;

        return paymentUrl;
    }

    @Override
    public boolean validateSignature(Map<String, String> params) {
        return VNPayUtil.validateSignature(new HashMap<>(params), vnPayConfig.getHashSecret());
    }
}