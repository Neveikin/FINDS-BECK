package com.Finds.dev.Security.jwt;

import com.Finds.dev.Entity.User;
import com.Finds.dev.Security.CustomUserDetails;
import com.Finds.dev.Security.CustomUserDetailsService;
import com.Finds.dev.Security.CookieUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {
    private final JwtCore jwtCore;
    private final CustomUserDetailsService customUserDetailsService;
    private final CookieUtils cookieUtils;

    public JwtFilter(JwtCore jwtCore, CustomUserDetailsService customUserDetailsService, CookieUtils cookieUtils) {
        this.jwtCore = jwtCore;
        this.customUserDetailsService = customUserDetailsService;
        this.cookieUtils = cookieUtils;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        System.out.println("JWT Filter - Processing request: " + request.getRequestURI());
        System.out.println("JWT Filter - Method: " + request.getMethod());
        
        try {
            String token = getTokenFromRequest(request);
            
            System.out.println("JWT Filter - Token found: " + (token != null ? "YES" : "NO"));
            
            if (token != null) {
                System.out.println("JWT Filter - Token: " + token.substring(0, Math.min(token.length(), 20)) + "...");
                boolean isValid = jwtCore.validateToken(token);
                System.out.println("JWT Filter - Token valid: " + isValid);
                
                if (isValid) {
                    setCustomUserDetailsToSecurityContextHolder(token, request);
                    System.out.println("JWT Filter - User authenticated successfully");
                } else {
                    System.out.println("JWT Filter - Token validation failed");
                }
            } else {
                System.out.println("JWT Filter - No token found in request");
            }
        } catch (Exception e) {
            System.out.println("JWT Filter - Exception: " + e.getMessage());
            e.printStackTrace();
        }

        System.out.println("JWT Filter - Continuing filter chain");
        filterChain.doFilter(request, response);
    }

    private void setCustomUserDetailsToSecurityContextHolder(String token, HttpServletRequest request) {
        String email = jwtCore.getEmailFromToken(token);
        
        CustomUserDetails customUserDetails = (CustomUserDetails) customUserDetailsService.loadUserByUsername(email);
        
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                customUserDetails, null, customUserDetails.getAuthorities()
            );
            authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        }
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        System.out.println("JWT Filter - Authorization header: " + bearerToken);
        
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            System.out.println("JWT Filter - Token from Authorization header: " + token.substring(0, Math.min(token.length(), 20)) + "...");
            return token;
        }
        
        String cookieToken = cookieUtils.getAccessTokenFromCookie(request);
        System.out.println("JWT Filter - Token from cookie: " + (cookieToken != null ? cookieToken.substring(0, Math.min(cookieToken.length(), 20)) + "..." : "NULL"));
        
        // Приоритет Authorization header над cookies
        if (cookieToken != null && !cookieToken.isEmpty()) {
            System.out.println("JWT Filter - Using token from cookie as fallback");
            return cookieToken;
        }
        
        System.out.println("JWT Filter - No token found in request");
        return null;
    }
}
