package com.Finds.dev.Security.config;

import com.Finds.dev.Security.CookieUtils;
import com.Finds.dev.Security.CustomUserDetailsService;
import com.Finds.dev.Security.jwt.JwtCore;
import com.Finds.dev.Security.jwt.JwtFilter;
import com.Finds.dev.Services.CustomOAuth2UserService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtCore jwtCore;
    private final CookieUtils cookieUtils;
    private final CustomOAuth2UserService customOAuth2UserService;

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    public SecurityConfig(CustomUserDetailsService customUserDetailsService, JwtCore jwtCore, CookieUtils cookieUtils, CustomOAuth2UserService customOAuth2UserService) {
        this.customUserDetailsService = customUserDetailsService;
        this.jwtCore = jwtCore;
        this.cookieUtils = cookieUtils;
        this.customOAuth2UserService = customOAuth2UserService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public JwtFilter jwtFilter() {
        return new JwtFilter(jwtCore, customUserDetailsService, cookieUtils);
    }

    @Bean
    public CustomOAuth2UserService oAuth2UserService() {
        return new CustomOAuth2UserService();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .httpBasic(org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authenticationProvider(authenticationProvider())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/shops/**").permitAll()
                        .requestMatchers("/api/lk/me/**").authenticated()
                        .requestMatchers("/favorites/**").authenticated()
                        .requestMatchers("/cart/**").authenticated()
                        .requestMatchers("/order/**").authenticated()
                        .anyRequest().permitAll())
                .oauth2Login(oauth -> oauth
                        .userInfoEndpoint(userInfo ->
                                userInfo.userService(oAuth2UserService())
                        )
                        .successHandler((request, response, authentication) -> {
                    OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
                    customOAuth2UserService.handleOAuth2Authentication(oauth2User, response);
                    
                    response.sendRedirect("http://localhost:3000");
                })
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"message\":\"Пользователь не авторизован. Пожалуйста, войдите в систему.\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"message\":\"Пользователь не авторизован. Пожалуйста, войдите в систему.\"}");
                        })
                );

        return http.build();
    }


    @Bean
    public org.springframework.web.cors.UrlBasedCorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.UrlBasedCorsConfigurationSource configurationSource = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        org.springframework.web.cors.CorsConfiguration config = new org.springframework.web.cors.CorsConfiguration();

        List<String> allowedOriginsList = Arrays.asList(allowedOrigins.split(","));
        config.setAllowedOrigins(allowedOriginsList);
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowCredentials(true);
        config.setExposedHeaders(Arrays.asList("Authorization"));
        config.setMaxAge(3600L);

        configurationSource.registerCorsConfiguration("/**", config);
        return configurationSource;
    }
}
