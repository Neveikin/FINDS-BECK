package com.Finds.dev.Services;

import com.Finds.dev.DTO.Auth.JwtAuth;
import com.Finds.dev.DTO.Auth.RefreshTokenDto;
import com.Finds.dev.DTO.Auth.UserCredentialsDto;
import com.Finds.dev.DTO.Auth.UserRegistrationDto;
import com.Finds.dev.Entity.User;
import com.Finds.dev.Redis.RedisService;
import com.Finds.dev.Repositories.CartRepository;
import com.Finds.dev.Repositories.UserRepository;
import com.Finds.dev.Security.jwt.JwtCore;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.access.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {
    // lsof -ti:8090 | xargs kill -9
    // cd /Users/ilanevejkin/Desktop/FINDS-BECK/frontend && python3 -m http.server 3001

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtCore jwtCore;
    
    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private RedisService redisService;

    public JwtAuth signin(UserCredentialsDto userCredentials) {
        String email = userCredentials.email();
        String password = userCredentials.password();

        Optional<User> user = userRepository.findByEmail(email);

        if (user.isEmpty()) {
            throw new EntityNotFoundException("User not found with email: " + email);
        }

        if (user.get().getStatus() == User.UserStatus.UNCONFIRMED) {
            throw new AccessDeniedException("UNCONFIRMED");
        }

        if (!passwordEncoder.matches(password, user.get().getPasswordHash())) {
            throw new IllegalArgumentException("Invalid password");
        }

        return jwtCore.generateAuthToken(email, user.get().getId(), user.get().getRole().name());
    }

    @Transactional
    public void signup(UserRegistrationDto registrationDto) {
        String email = registrationDto.email();
        String password = registrationDto.password();
        String name = registrationDto.name();
        String confirmPassword = registrationDto.confirmPassword();
        String role = registrationDto.role();

        if (!password.equals(confirmPassword)) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("User with this email already exists: " + email);
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setName(name);
        
        try {
            user.setRole(role != null ? User.UserRole.valueOf(role) : User.UserRole.USER);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + role);
        }
        
        user.setCreatedAt(LocalDateTime.now());
        user.setStatus(User.UserStatus.UNCONFIRMED);

        redisService.saveValue(redisService.getUserConfKey(email), user, RedisService.DurationType.D, 7);
    }

    public JwtAuth refresh(RefreshTokenDto refreshTokenDto) {
        String refreshToken = refreshTokenDto.refreshToken();
        
        if (!jwtCore.validateToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        String email = jwtCore.getEmailFromToken(refreshToken);
        String userId = jwtCore.getUserIdFromToken(refreshToken);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
        
        return jwtCore.refreshAccesToken(email, refreshToken, userId, user.getRole().name());
    }

    public Map<String, Object> updateUserRole(Map<String, String> request) {
        String email = request.get("email");
        String newRole = request.get("role");
        
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty");
        }
        
        if (newRole == null || newRole.trim().isEmpty()) {
            throw new IllegalArgumentException("Role cannot be empty");
        }
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        
        try {
            user.setRole(User.UserRole.valueOf(newRole));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + newRole);
        }
        
        userRepository.save(user);

        return Map.of(
            "success", true,
            "message", "User role updated successfully",
            "data", Map.of(
                "email", email,
                "newRole", newRole,
                "userId", user.getId()
            )
        );
    }
}
