package com.Finds.dev.Controllers;

import com.Finds.dev.DTO.Auth.TokenResponseDto;
import com.Finds.dev.DTO.Auth.UpdateEmailDto;
import com.Finds.dev.DTO.Auth.UpdateNameDto;
import com.Finds.dev.DTO.Auth.UpdatePasswordDto;
import com.Finds.dev.DTO.Auth.UserProfileDto;
import com.Finds.dev.Services.UserService;
import com.Finds.dev.Security.jwt.JwtCore;
import com.Finds.dev.Entity.User;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
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

    @GetMapping()
    public ResponseEntity<User> getUserProfile() {
        User profile = userService.getUserProfile();
        return ResponseEntity.ok(profile);
    }

    @PatchMapping("/email")
    public ResponseEntity<?> updateEmail(@RequestBody @Valid UpdateEmailDto updateEmailDto) {
        TokenResponseDto response = userService.updateEmail(updateEmailDto);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/name")
    public ResponseEntity<?> updateName(@RequestBody @Valid UpdateNameDto updateNameDto) {
        TokenResponseDto response = userService.updateName(updateNameDto);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/password")
    public ResponseEntity<?> updatePassword(@RequestBody @Valid UpdatePasswordDto updatePasswordDto) {
        UserProfileDto profile = userService.updatePassword(updatePasswordDto);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/admin/users/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> searchUsers(@RequestParam String email) {
        List<User> users = userService.searchUsersByEmail(email);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", users);
        response.put("count", users.size());
        
        return ResponseEntity.ok(response);
    }
}
