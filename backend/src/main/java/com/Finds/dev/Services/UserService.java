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
            System.out.println("UserService - Authentication: " + authentication);
            if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
                CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                String userId = String.valueOf(userDetails.getId());
                System.out.println("UserService - User ID from authentication: " + userId);
                return userId;
            }
        } catch (Exception e) {
            System.out.println("UserService - Exception getting current user: " + e.getMessage());
            return null;
        }
        System.out.println("UserService - Authentication is null or not CustomUserDetails");
        return null;
    }

    public User getCurrentUser() {
        String userId = getCurrentUserId();
        if (userId == null) {
            throw new EntityNotFoundException("Пользователь не аутентифицирован");
        }
        
        return userRepository.findById(userId)
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

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void changeUserRole(String userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        user.setRole(User.UserRole.valueOf(role.toUpperCase()));
        userRepository.save(user);
    }

    public UserProfileDto updateProfile(UserProfileDto updateDto) {
        System.out.println("UserService - Updating profile for user...");
        User user = getCurrentUser();
        System.out.println("UserService - Current user: " + user.getEmail() + " (" + user.getId() + ")");
        
        if (updateDto.getFirstName() != null) user.setFirstName(updateDto.getFirstName());
        if (updateDto.getLastName() != null) user.setLastName(updateDto.getLastName());
        if (updateDto.getBirthDate() != null) user.setBirthDate(updateDto.getBirthDate());
        if (updateDto.getGender() != null) user.setGender(updateDto.getGender());
        if (updateDto.getCity() != null) user.setCity(updateDto.getCity());
        if (updateDto.getStreet() != null) user.setStreet(updateDto.getStreet());
        if (updateDto.getHouse() != null) user.setHouse(updateDto.getHouse());
        if (updateDto.getPhone() != null) user.setPhone(updateDto.getPhone());
        if (updateDto.getName() != null) user.setName(updateDto.getName());

        try {
            System.out.println("UserService - Saving user...");
            user = userRepository.save(user);
            System.out.println("UserService - User saved successfully");
        } catch (Exception e) {
            System.out.println("UserService - Error saving user: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
        return new UserProfileDto(user);
    }
}
