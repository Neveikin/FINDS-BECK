package com.Finds.dev.Security.jwt;

import com.Finds.dev.DTO.Auth.JwtAuth;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtCore {

    @Value("${jwt.secret:mySuperSecretKeyForJWTTokenGenerationThatIsLongEnoughForHS256Algorithm}")
    private String secret;

    public JwtAuth refreshAccesToken(String email, String refreshToken, String userId, String role) {
        JwtAuth jwtAuth = new JwtAuth();
        jwtAuth.setAccesToken(generateAccesToken(email, userId, role));
        jwtAuth.setRefershToken(refreshToken);
        return jwtAuth;
    }

    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }
    
    public String getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.get("userId", String.class);
    }
    
    public String getUserRoleFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.get("role", String.class);
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public JwtAuth generateAuthToken(String email, String userId, String role) {
        JwtAuth jwtAuth = new JwtAuth();
        jwtAuth.setAccesToken(generateAccesToken(email, userId, role));
        jwtAuth.setRefershToken(generateRefreshToken(email, userId));
        return jwtAuth;
    }
    
    public JwtAuth generateAuthToken(String email) {
        JwtAuth jwtAuth = new JwtAuth();
        jwtAuth.setAccesToken(generateAccesToken(email, "", ""));
        jwtAuth.setRefershToken(generateRefreshToken(email, ""));
        return jwtAuth;
    }

    public String generateAccesToken(String email, String userId, String role) {
        Date date = Date.from((LocalDateTime.now().plusMinutes(60).atZone(ZoneId.systemDefault()).toInstant()));
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("role", role);
        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .expiration(date)
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(String email, String userId) {
        Date date = Date.from((LocalDateTime.now().plusDays(30).atZone(ZoneId.systemDefault()).toInstant()));
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("type", "refresh");
        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .expiration(date)
                .signWith(getSigningKey())
                .compact();
    }
}
