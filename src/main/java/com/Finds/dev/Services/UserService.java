package com.Finds.dev.Services;

import com.Finds.dev.DTO.Auth.UpdateEmailDto;
import com.Finds.dev.DTO.Auth.UpdateNameDto;
import com.Finds.dev.DTO.Auth.UpdatePasswordDto;
import com.Finds.dev.DTO.Auth.UserProfileDto;
import com.Finds.dev.Entity.User;
import com.Finds.dev.Repositories.UserRepository;
import com.Finds.dev.Security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public String getCurrentUserId() {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder
                    .getContext().getAuthentication().getPrincipal();
            return userDetails.getUser().getId();
        } catch (Exception e) {
            return null;
        }
    }

    public User getCurrentUser() {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (userDetails == null || userDetails.getUser() == null) {
                throw new RuntimeException("Пользователь не аутентифицирован");
            }
            return userDetails.getUser();
        } catch (ClassCastException e) {
            throw new RuntimeException("Ошибка аутентификации. Пожалуйста, войдите снова.");
        } catch (Exception e) {
            throw new RuntimeException("Ошибка получения данных пользователя: " + e.getMessage());
        }
    }

    public UserProfileDto getUserProfile() {
        User user = getCurrentUser();
        return new UserProfileDto(user);
    }

    public UserProfileDto updateEmail(UpdateEmailDto updateEmailDto) {
        User user = getCurrentUser();
        String newEmail = updateEmailDto.getEmail();

        if (userRepository.existsByEmail(newEmail) && !newEmail.equals(user.getEmail())) {
            throw new RuntimeException("User already exists with email: " + newEmail);
        }

        user.setEmail(newEmail);
        user = userRepository.save(user);
        return new UserProfileDto(user);
    }

    public UserProfileDto updateName(UpdateNameDto updateNameDto) {
        User user = getCurrentUser();
        user.setName(updateNameDto.getName());
        user = userRepository.save(user);
        return new UserProfileDto(user);
    }

    public UserProfileDto updatePassword(UpdatePasswordDto updatePasswordDto) {
        try {
            User user = getCurrentUser();
            String currentPassword = updatePasswordDto.getCurrentPassword();
            String newPassword = updatePasswordDto.getNewPassword();

            if (currentPassword == null || currentPassword.trim().isEmpty()) {
                throw new RuntimeException("Текущий пароль не может быть пустым");
            }
            
            if (newPassword == null || newPassword.trim().isEmpty()) {
                throw new RuntimeException("Новый пароль не может быть пустым");
            }
            
            if (newPassword.length() < 6) {
                throw new RuntimeException("Новый пароль должен содержать минимум 6 символов");
            }
            
            if (currentPassword.equals(newPassword)) {
                throw new RuntimeException("Новый пароль должен отличаться от текущего");
            }

            if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
                throw new RuntimeException("Текущий пароль указан неверно");
            }

            user.setPasswordHash(passwordEncoder.encode(newPassword));
            user = userRepository.save(user);
            return new UserProfileDto(user);
            
        } catch (ClassCastException e) {
            throw new RuntimeException("Ошибка аутентификации. Пожалуйста, войдите снова.");
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при смене пароля: " + e.getMessage());
        }
    }

    public List<User> searchUsersByEmail(String email) {
        try {
            List<User> users = new ArrayList<>();
            Optional<User> user = userRepository.findByEmail(email);
            user.ifPresent(users::add);
            return users;
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при поиске пользователей: " + e.getMessage());
        }
    }
}
