package com.Finds.dev.Controllers;

import com.Finds.dev.DTO.Auth.*;
import com.Finds.dev.Services.AuthService;
import com.Finds.dev.Repositories.UserRepository;
import com.Finds.dev.Services.MailConfirmService;
import com.Finds.dev.Security.CookieUtils;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS})
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private MailConfirmService mailConfirmService;

    @Autowired
    private CookieUtils cookieUtils;

    @PostMapping("/signin")
    public ResponseEntity<SignInResponseDto> signin(@RequestBody @Valid UserCredentialsDto userCredentials, HttpServletResponse response) {
        System.out.println("AuthController - Signin request for email: " + userCredentials.email());
        
        try {
            SignInResponseDto signInResponse = authService.signin(userCredentials);
            System.out.println("AuthController - Generated token: " + signInResponse.token().substring(0, Math.min(signInResponse.token().length(), 20)) + "...");
            
            cookieUtils.setAuthCookies(response, signInResponse.token(), signInResponse.refreshToken(), userCredentials.email());
            System.out.println("AuthController - Cookies set successfully");
            
            ResponseEntity<SignInResponseDto> result = ResponseEntity.ok(signInResponse);
            System.out.println("AuthController - Response sent with status: " + result.getStatusCode());
            return result;
        } catch (Exception e) {
            System.out.println("AuthController - Login failed: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody @Valid UserRegistrationDto registrationDto) {
        authService.signup(registrationDto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(name = "refreshToken", required = false) String refreshToken, 
                                   @CookieValue(name = "user", required = false) String userEmail,
                                   @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
                                   HttpServletResponse response) {

        // Try to get refresh token from Authorization header first
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String tokenFromHeader = authorizationHeader.substring(7);
            System.out.println("AuthController - Token from Authorization header: " + tokenFromHeader.substring(0, Math.min(tokenFromHeader.length(), 20)) + "...");
            // Use the token from header as refresh token
            refreshToken = tokenFromHeader;
        }

        if (refreshToken == null) {
            return ResponseEntity.badRequest().body("Refresh token not found");
        }
        
        try {
            RefreshTokenDto refreshTokenDto = new RefreshTokenDto(refreshToken);
            JwtAuth jwtAuth = authService.refresh(refreshTokenDto);
            
            // Return new tokens in response body
            Map<String, Object> userMap = Map.of(
                "id", "temp-id", // Will be updated by client
                "email", userEmail != null ? userEmail : "user@example.com",
                "name", "User",
                "roles", new String[]{"USER"}
            );
            
            Map<String, Object> tokenResponse = Map.of(
                "token", jwtAuth.getAccesToken(),
                "refreshToken", jwtAuth.getRefershToken(),
                "user", userMap
            );
            
            // Also set cookies for backward compatibility
            if (userEmail != null) {
                cookieUtils.setAuthCookies(response, jwtAuth.getAccesToken(), jwtAuth.getRefershToken(), userEmail);
            }
            
            return ResponseEntity.ok(tokenResponse);
        } catch (Exception e) {
            System.out.println("AuthController - Refresh failed: " + e.getMessage());
            return ResponseEntity.badRequest().body("Token refresh failed: " + e.getMessage());
        }
    }

    @PostMapping("/update-role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@RequestBody Map<String, String> request) {
        Map<String, Object> response = authService.updateUserRole(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        cookieUtils.clearAuthCookies(response);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/email-confirm/{email}")
    public ResponseEntity<?> email_confirm(@PathVariable String email) {
        mailConfirmService.sendCode(email);
        return ResponseEntity.ok("Проверьте почту");
    }
      
    @PostMapping("/confirm-email")
    public ResponseEntity<?> confirmEmail(@RequestBody @Valid EmailConfirmDTO emailConfirmDTO) {
        mailConfirmService.confirm(emailConfirmDTO);
        return ResponseEntity.ok("Email подтвержден");
    }

}
