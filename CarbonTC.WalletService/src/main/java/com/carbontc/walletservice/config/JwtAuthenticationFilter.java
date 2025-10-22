package com.carbontc.walletservice.config;

import com.carbontc.walletservice.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");
        final String jwt;
        final String userId;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authorizationHeader.substring(7);

        try{
            if (jwtUtil.validateToken(jwt)){
                // Token hợp lệ, lấy thông tin user
                userId = jwtUtil.extractUserId(jwt);
                String role  = jwtUtil.extractRole(jwt);

                // Tạo đối tượng GrantedAuthority từ role'
                List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(role));

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userId,jwt,authorities);

                // Tạo đối tượng xác thực
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userId, // Đây chính là "Principal" (thông tin user)
                                null,
                                authorities
                        );

                // Đặt thông tin xác thực vào Security Context
                // Từ đây, Spring Security sẽ biết user này đã đăng nhập
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception e) {
            // Xử lý lỗi (ví dụ: log token không hợp lệ)
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
