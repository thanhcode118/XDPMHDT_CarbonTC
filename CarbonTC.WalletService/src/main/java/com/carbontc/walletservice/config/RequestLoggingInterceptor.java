package com.carbontc.walletservice.config;

import com.carbontc.walletservice.util.AuthencationUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class RequestLoggingInterceptor implements HandlerInterceptor {
    private static final Logger log = LoggerFactory.getLogger(RequestLoggingInterceptor.class);

    private AuthencationUtil authencationUtil;
    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        try {
            // Thử lấy userId của người đã đăng nhập
            String userId = authencationUtil.getAuthenticatedUserId();
            log.info("API REQUEST: User [{}] --- Method [{}] --- URI [{}]",
                    userId, method, requestURI);
        } catch (Exception e) {
            String userId = "ANONYMOUS";
            log.info("API REQUEST: User [{}] --- Method [{}] --- URI [{}]",
                    userId, method, requestURI);
        }
        return true;
    }

}
