package com.Finds.dev.Services;

import com.Finds.dev.DTO.Auth.JwtAuth;
import com.Finds.dev.DTO.Auth.RefreshTokenDto;
import com.Finds.dev.DTO.Auth.UserCredentialsDto;
import com.Finds.dev.DTO.Auth.UserRegistrationDto;
import com.Finds.dev.Entity.User;
import com.Finds.dev.Repositories.UserRepository;
import com.Finds.dev.Security.jwt.JwtCore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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

    public JwtAuth signin(UserCredentialsDto userCredentials) {
        String email = userCredentials.getEmail();
        String password = userCredentials.getPassword();

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found with email: " + email);
        }

        User user = userOptional.get();
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }

        return jwtCore.generateAuthToken(email, user.getId(), user.getRole().name());
    }

    public JwtAuth signup(UserRegistrationDto registrationDto) {
        String email = registrationDto.getEmail();
        String password = registrationDto.getPassword();
        String name = registrationDto.getName();
        String confirmPassword = registrationDto.getConfirmPassword();
        String role = registrationDto.getRole();

        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email не может быть пустым");
        }

        if (password == null || password.length() < 6) {
            throw new RuntimeException("Пароль должен содержать минимум 6 символов");
        }

        if (!password.equals(confirmPassword)) {
            throw new RuntimeException("Пароли не совпадают");
        }

        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Имя не может быть пустым");
        }

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Пользователь с таким email уже существует: " + email);
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setName(name);
        user.setRole(role != null ? User.UserRole.valueOf(role) : User.UserRole.USER);
        user.setCreatedAt(LocalDateTime.now());

        user = userRepository.save(user);

        return jwtCore.generateAuthToken(email, user.getId(), user.getRole().name());
    }

    public JwtAuth refresh(RefreshTokenDto refreshTokenDto) {
        String refreshToken = refreshTokenDto.getRefreshToken();
        
        if (!jwtCore.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        String email = jwtCore.getEmailFromToken(refreshToken);
        String userId = jwtCore.getUserIdFromToken(refreshToken);
        
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found with email: " + email);
        }

        User user = userOptional.get();
        
        return jwtCore.refreshAccesToken(email, refreshToken, userId, user.getRole().name());
    }
}
