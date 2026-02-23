package com.Finds.dev.Services;

import com.Finds.dev.DTO.Auth.UpdateEmailDto;
import com.Finds.dev.DTO.Auth.UpdateNameDto;
import com.Finds.dev.DTO.Auth.UpdatePasswordDto;
import com.Finds.dev.DTO.Auth.UserProfileDto;
import com.Finds.dev.DTO.Auth.TokenResponseDto;
import com.Finds.dev.Entity.AuthProvider;
import com.Finds.dev.Entity.User;
import com.Finds.dev.Repositories.AuthProviderRepository;
import com.Finds.dev.Repositories.UserRepository;
import com.Finds.dev.Security.CustomUserDetails;
import com.Finds.dev.Security.jwt.JwtCore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthProviderRepository authProviderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtCore jwtCore;

    public String getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null) {
                return authentication.getName();
            }
        } catch (Exception e) {
            return null;
        }
        return null;
    }

    public User getCurrentUser() {
        String email = getCurrentUserId();
        if (email == null) {
            throw new EntityNotFoundException("Пользователь не аутентифицирован");
        }
        
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Пользователь не найден"));
    }

    public User getUserProfile() {
        User user = getCurrentUser();
        return user;
    }

    public TokenResponseDto updateEmail(UpdateEmailDto updateEmailDto) {
        User user = getCurrentUser();
        String newEmail = updateEmailDto.email();

        if (userRepository.existsByEmail(newEmail) && !newEmail.equals(user.getEmail())) {
            throw new IllegalArgumentException("User already exists with email: " + newEmail);
        }

        user.setEmail(newEmail);
        user = userRepository.save(user);
        UserProfileDto profile = new UserProfileDto(user);
        
        String newAccessToken = jwtCore.generateAccesToken(user.getEmail(), String.valueOf(user.getId()), user.getRole().name());
        String newRefreshToken = jwtCore.generateRefreshToken(user.getEmail(), String.valueOf(user.getId()));
        
        return new TokenResponseDto(newAccessToken, newRefreshToken, profile);
    }

    public TokenResponseDto updateName(UpdateNameDto updateNameDto) {
        User user = getCurrentUser();
        user.setName(updateNameDto.name());
        user = userRepository.save(user);
        UserProfileDto profile = new UserProfileDto(user);
        
        String newAccessToken = jwtCore.generateAccesToken(user.getEmail(), String.valueOf(user.getId()), user.getRole().name());
        String newRefreshToken = jwtCore.generateRefreshToken(user.getEmail(), String.valueOf(user.getId()));
        
        return new TokenResponseDto(newAccessToken, newRefreshToken, profile);
    }

    public UserProfileDto updatePassword(UpdatePasswordDto updatePasswordDto) {
        User user = getCurrentUser();
        String currentPassword = updatePasswordDto.currentPassword();
        String newPassword = updatePasswordDto.newPassword();

        if (currentPassword.equals(newPassword)) {
            throw new IllegalArgumentException("New password must be different from current password");
        }

        AuthProvider localAuthProvider = authProviderRepository.findByUserAndProvider(user, AuthProvider.Provider.LOCAL)
                .orElseThrow(() -> new EntityNotFoundException("Локальная аутентификация не найдена"));

        String currentPasswordHash = authProviderRepository.findPasswordHashByUserAndProvider(user.getId(), AuthProvider.Provider.LOCAL);
        if (currentPasswordHash == null || !passwordEncoder.matches(currentPassword, currentPasswordHash)) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        String newPasswordHash = passwordEncoder.encode(newPassword);
        authProviderRepository.updatePasswordHashByUserAndProvider(user.getId(), newPasswordHash, AuthProvider.Provider.LOCAL);
        
        return new UserProfileDto(user);
    }

    public List<User> searchUsersByEmail(String email) {
        List<User> users = new ArrayList<>();
        Optional<User> user = userRepository.findByEmail(email);
        user.ifPresent(users::add);
        return users;
    }
}
