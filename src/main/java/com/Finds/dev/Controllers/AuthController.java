package com.Finds.dev.Controllers;

import com.Finds.dev.DTO.Auth.*;
import com.Finds.dev.Services.AuthService;
import com.Finds.dev.Entity.User;
import com.Finds.dev.Repositories.UserRepository;
import com.Finds.dev.Services.MailConfirmService;
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

    @Autowired
    private MailConfirmService mailConfirmService;

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
            authService.signup(registrationDto);
            return ResponseEntity.ok().build();
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


      @PostMapping("/email-confirm/{email}")
      public ResponseEntity<?> email_confirm(@PathVariable String email) {
          try {
              System.out.println("DEBUG: Controller received request for email: " + email);
              mailConfirmService.sendCode(email);
              System.out.println("DEBUG: Controller - email sent successfully");
              return ResponseEntity.ok("Проверьте почту");
          } catch (Exception e) {
              System.out.println("DEBUG: Controller - Exception occurred: " + e.getMessage());
              e.printStackTrace();
              return ResponseEntity.badRequest().body("Ошибка: " + e.getMessage());
          }
      }
      
      @PostMapping("/confirm-email")
      public ResponseEntity<?> confirmEmail(@RequestBody EmailConfirmDTO emailConfirmDTO) {
          try {
              mailConfirmService.confirm(emailConfirmDTO);
              return ResponseEntity.ok("Email подтвержден");
          } catch (Exception e) {
              return ResponseEntity.badRequest().body(e.getMessage());
          }
      }

}
