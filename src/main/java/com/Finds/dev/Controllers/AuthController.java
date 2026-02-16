package com.Finds.dev.Controllers;

import com.Finds.dev.DTO.Auth.JwtAuth;
import com.Finds.dev.DTO.Auth.RefreshTokenDto;
import com.Finds.dev.DTO.Auth.UserCredentialsDto;
import com.Finds.dev.DTO.Auth.UserRegistrationDto;
import com.Finds.dev.Services.AuthService;
import com.Finds.dev.Entity.User;
import com.Finds.dev.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS})
public class AuthController {

    @Autowired
    private AuthService authService;
    
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody UserCredentialsDto userCredentials) {
        try {
            JwtAuth jwtAuth = authService.signin(userCredentials);
            return ResponseEntity.ok(jwtAuth);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody UserRegistrationDto registrationDto) {
        try {
            JwtAuth jwtAuth = authService.signup(registrationDto);
            return ResponseEntity.ok(jwtAuth);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshTokenDto refreshTokenDto) {
        try {
            JwtAuth jwtAuth = authService.refresh(refreshTokenDto);
            return ResponseEntity.ok(jwtAuth);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @PostMapping("/update-role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String newRole = request.get("role");
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            user.setRole(User.UserRole.valueOf(newRole));
            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User role updated successfully");
            response.put("data", Map.of(
                "email", email,
                "newRole", newRole,
                "userId", user.getId()
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "ROLE_UPDATE_FAILED");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}
