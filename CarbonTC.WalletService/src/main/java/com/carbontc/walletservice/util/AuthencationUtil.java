package com.carbontc.walletservice.util;

import com.carbontc.walletservice.exception.BusinessException;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuthencationUtil {

    public String getAuthenticatedUserId() throws BusinessException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new BusinessException("Truy cập không được phép. Token không hợp lệ hoặc bị thiếu.");
        }

        return (String) authentication.getPrincipal();
    }
}
