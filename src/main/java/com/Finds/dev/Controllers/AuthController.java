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
    private UserRepository userRepository;

    @Autowired
    private MailConfirmService mailConfirmService;

    @Autowired
    private CookieUtils cookieUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody @Valid UserCredentialsDto userCredentials, HttpServletResponse response) {
        JwtAuth jwtAuth = authService.signin(userCredentials);
        
        cookieUtils.setAuthCookies(response, jwtAuth.getAccesToken(), jwtAuth.getRefershToken(), userCredentials.email());
        
        return ResponseEntity.ok().build();
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody @Valid UserRegistrationDto registrationDto) {
        authService.signup(registrationDto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody @Valid RefreshTokenDto refreshTokenDto) {
        return ResponseEntity.ok(authService.refresh(refreshTokenDto));
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
