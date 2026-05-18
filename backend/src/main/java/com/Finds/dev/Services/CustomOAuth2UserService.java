package com.Finds.dev.Services;

import com.Finds.dev.Entity.AuthProvider;
import com.Finds.dev.Entity.User;
import com.Finds.dev.Repositories.AuthProviderRepository;
import com.Finds.dev.Repositories.UserRepository;
import com.Finds.dev.Security.CookieUtils;
import com.Finds.dev.Security.jwt.JwtCore;
import com.Finds.dev.DTO.Auth.JwtAuth;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2UserService.class);
    
    private final OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
    
    @Autowired
    private AuthProviderRepository authProviderRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtCore jwtCore;
    
    @Autowired
    private CookieUtils cookieUtils;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        
        logger.info("OAuth2 User Loading Started");
        logger.info("Client Registration: {}", userRequest.getClientRegistration().getRegistrationId());
        
        OAuth2User oauth2User = delegate.loadUser(userRequest);
        
        logger.info("OAuth2 User Attributes: {}", oauth2User.getAttributes());
        
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String providerId = oauth2User.getAttribute("sub");
        
        logger.info("Email: {}", email);
        logger.info("Name: {}", name);
        logger.info("ProviderId: {}", providerId);
        
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        AuthProvider.Provider provider = AuthProvider.Provider.valueOf(registrationId.toUpperCase());
        
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setRole(User.UserRole.USER);
            user.setStatus(User.UserStatus.CONFIRMED);
            user = userRepository.save(user);
            
            if (providerId == null) {
                logger.error("Provider ID is null for user: {}", email);
                throw new OAuth2AuthenticationException("Provider ID is null for user: " + email);
            }
            
            logger.info("Creating new user and auth provider for email: {}", email);
            AuthProvider authProvider = new AuthProvider(user, provider, providerId);
            authProviderRepository.save(authProvider);
            logger.info("Auth provider saved successfully");
        }
        
        AuthProvider authProviderUser = new AuthProvider(oauth2User, email, name, providerId);
        authProviderUser.setUser(user);
        authProviderUser.setProvider(provider);
        
        return authProviderUser;
    }
    
    public void handleOAuth2Authentication(OAuth2User oauth2User, jakarta.servlet.http.HttpServletResponse response) {
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        
        logger.info("=== OAuth2 Authentication Handler Started ===");
        logger.info("Email: {}", email);
        logger.info("Name: {}", name);
        logger.info("OAuth2 User Attributes: {}", oauth2User.getAttributes());
        
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            logger.info("Creating new user for email: {}", email);
            user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setRole(User.UserRole.USER);
            user.setStatus(User.UserStatus.CONFIRMED);
            user = userRepository.save(user);
            logger.info("User saved with ID: {}", user.getId());
            
            String providerId = oauth2User.getAttribute("sub");
            if (providerId == null) {
                logger.error("Provider ID is null for user: {}", email);
                throw new OAuth2AuthenticationException("Provider ID is null for user: " + email);
            }
            
            AuthProvider.Provider provider = AuthProvider.Provider.GOOGLE;
            AuthProvider authProvider = new AuthProvider(user, provider, providerId);
            authProviderRepository.save(authProvider);
            logger.info("Auth provider saved successfully");
        } else {
            logger.info("Found existing user with ID: {}", user.getId());
        }
        
        JwtAuth jwtAuth = jwtCore.generateAuthToken(email, user.getId().toString(), user.getRole().toString());
        logger.info("JWT tokens generated - Access: {}, Refresh: {}", 
                   jwtAuth.getAccesToken() != null ? "OK" : "NULL", 
                   jwtAuth.getRefershToken() != null ? "OK" : "NULL");
        
        cookieUtils.setAuthCookies(response, jwtAuth.getAccesToken(), jwtAuth.getRefershToken(), email);
        logger.info("Cookies set for user: {}", email);
        
        logger.info(" OAuth2 Authentication Handler Completed ");
    }
}
