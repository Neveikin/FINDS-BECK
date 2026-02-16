package com.Finds.dev.Controllers;

import com.Finds.dev.DTO.Auth.TokenResponseDto;
import com.Finds.dev.DTO.Auth.UpdateEmailDto;
import com.Finds.dev.DTO.Auth.UpdateNameDto;
import com.Finds.dev.DTO.Auth.UpdatePasswordDto;
import com.Finds.dev.DTO.Auth.UserProfileDto;
import com.Finds.dev.Services.UserService;
import com.Finds.dev.Security.jwt.JwtCore;
import com.Finds.dev.Entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lk/me")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS})
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtCore jwtCore;

    @GetMapping("/get")
    public ResponseEntity<UserProfileDto> getUserProfile() {
        try {
            UserProfileDto profile = userService.getUserProfile();
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/email")
    public ResponseEntity<?> updateEmail(@RequestBody UpdateEmailDto updateEmailDto) {
        try {
            UserProfileDto profile = userService.updateEmail(updateEmailDto);
            
            User user = userService.getCurrentUser();
            String newAccessToken = jwtCore.generateAccesToken(user.getEmail(), String.valueOf(user.getId()), user.getRole().name());
            String newRefreshToken = jwtCore.generateRefreshToken(user.getEmail(), String.valueOf(user.getId()));
            
            TokenResponseDto response = new TokenResponseDto(newAccessToken, newRefreshToken, profile);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PatchMapping("/name")
    public ResponseEntity<?> updateName(@RequestBody UpdateNameDto updateNameDto) {
        try {
            UserProfileDto profile = userService.updateName(updateNameDto);
            
            User user = userService.getCurrentUser();
            String newAccessToken = jwtCore.generateAccesToken(user.getEmail(), String.valueOf(user.getId()), user.getRole().name());
            String newRefreshToken = jwtCore.generateRefreshToken(user.getEmail(), String.valueOf(user.getId()));
            
            TokenResponseDto response = new TokenResponseDto(newAccessToken, newRefreshToken, profile);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PatchMapping("/password")
    public ResponseEntity<?> updatePassword(@RequestBody UpdatePasswordDto updatePasswordDto) {
        try {
            UserProfileDto profile = userService.updatePassword(updatePasswordDto);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "PASSWORD_UPDATE_FAILED");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/admin/users/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> searchUsers(@RequestParam String email) {
        try {
            List<User> users = userService.searchUsersByEmail(email);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", users);
            response.put("count", users.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "USER_SEARCH_FAILED");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
