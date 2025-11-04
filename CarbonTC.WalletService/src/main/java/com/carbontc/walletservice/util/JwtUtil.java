package com.carbontc.walletservice.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private  String secret;

    @Value("${jwt.issuer}")
    private String issuer;

    @Value("${jwt.audience}")
    private String audience;

    private Key getSigningKey(){
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // lấy thông tin payload từ token
    public Claims extractAllClaims(String token){
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .requireIssuer(issuer)
                .requireAudience(audience)
                .build()
                .parseClaimsJws(token).getBody();
    }

    public boolean validateToken(String token){
        try {
            Claims claims = extractAllClaims(token);
            boolean notExpired = !claims.getExpiration().before(new Date());
            System.out.println("[JwtUtil] Token expiration: " + claims.getExpiration());
            System.out.println("[JwtUtil] Token valid (not expired): " + notExpired);
            return notExpired;
        } catch (Exception e) {
            System.out.println("[JwtUtil] ❌ Validation error: " + e.getMessage());
            return false;
        }
    }

    public String extractUserId(String token) {
        final Claims claims = extractAllClaims(token);
        String userId = claims.get("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier", String.class);
        System.out.println("[JwtUtil] Extracted UserId: " + userId);
        return userId;
    }

    public String extractRole(String token) {
        final Claims claims = extractAllClaims(token);
        String role = claims.get("http://schemas.microsoft.com/ws/2008/06/identity/claims/role", String.class);
        System.out.println("[JwtUtil] Extracted Role: " + role);
        return role;
    }


}
