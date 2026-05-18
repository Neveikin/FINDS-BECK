package com.Finds.dev.Controllers;

import com.Finds.dev.DTO.Auth.TokenResponseDto;
import com.Finds.dev.DTO.Auth.UpdateEmailDto;
import com.Finds.dev.DTO.Auth.UpdateNameDto;
import com.Finds.dev.DTO.Auth.UpdatePasswordDto;
import com.Finds.dev.DTO.Auth.UserProfileDto;
import com.Finds.dev.Services.UserService;
import com.Finds.dev.Security.jwt.JwtCore;
import com.Finds.dev.Security.CookieUtils;
import com.Finds.dev.Entity.User;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletResponse;
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
    
    @Autowired
    private CookieUtils cookieUtils;

    @GetMapping()
    public ResponseEntity<?> getUserProfile() {
        User user = userService.getUserProfile();
        return ResponseEntity.ok(constructUserResponse(user));
    }

    @PutMapping()
    public ResponseEntity<?> updateProfile(@RequestBody UserProfileDto updateDto) {
        userService.updateProfile(updateDto);
        User user = userService.getUserProfile();
        return ResponseEntity.ok(constructUserResponse(user));
    }

    private Map<String, Object> constructUserResponse(User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("name", user.getName() != null ? user.getName() : "");
        response.put("roles", user.getRole() != null ? new String[]{user.getRole().name()} : new String[]{"USER"});
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("birthDate", user.getBirthDate());
        response.put("gender", user.getGender());
        response.put("city", user.getCity());
        response.put("street", user.getStreet());
        response.put("house", user.getHouse());
        response.put("phone", user.getPhone());
        return response;
    }

    @PatchMapping("/email")
    public ResponseEntity<?> updateEmail(@RequestBody @Valid UpdateEmailDto updateEmailDto, 
                                       @CookieValue(name = "user", required = false) String currentUserEmail, HttpServletResponse response) {

        TokenResponseDto tokenResponse = userService.updateEmail(updateEmailDto);
        cookieUtils.setAuthCookies(response, tokenResponse.getAccesToken(), tokenResponse.getRefershToken(), tokenResponse.getUser().getEmail());
        return ResponseEntity.ok(tokenResponse.getUser());
    }

    @PatchMapping("/name")
    public ResponseEntity<?> updateName(@RequestBody @Valid UpdateNameDto updateNameDto,
                                      @CookieValue(name = "user", required = false) String currentUserEmail, HttpServletResponse response) {

        TokenResponseDto tokenResponse = userService.updateName(updateNameDto);
        cookieUtils.setAuthCookies(response, tokenResponse.getAccesToken(), tokenResponse.getRefershToken(), tokenResponse.getUser().getEmail());
        return ResponseEntity.ok(tokenResponse.getUser());
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
    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PatchMapping("/admin/users/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> changeUserRole(@PathVariable String userId, @RequestBody Map<String, String> request) {
        String newRole = request.get("role");
        userService.changeUserRole(userId, newRole);
        return ResponseEntity.ok(Map.of("success", true, "message", "Role updated successfully"));
    }
}
