package com.medicare360.controller;

import com.medicare360.dto.*;
import com.medicare360.entity.User;
import com.medicare360.exception.ResourceNotFoundException;
import com.medicare360.repository.UserRepository;
import com.medicare360.security.UserPrincipal;
import com.medicare360.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @GetMapping("/check-admin")
    public ResponseEntity<Map<String, Boolean>> checkAdmin() {
        return ResponseEntity.ok(Map.of("hasAdmin", authService.checkAdminExists()));
    }

    @PostMapping("/setup-admin")
    public ResponseEntity<TokenResponse> setupAdmin(
            @Valid @RequestBody UserCreateRequest req,
            HttpServletRequest request
    ) {
        TokenResponse token = authService.setupAdmin(
                req.getEmail(),
                req.getPassword(),
                req.getFullName(),
                req.getPhoneNumber(),
                request.getRemoteAddr(),
                request.getHeader("User-Agent")
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(token);
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest req,
            HttpServletRequest request
    ) {
        UserResponse user = authService.registerPatient(
                req,
                request.getRemoteAddr(),
                request.getHeader("User-Agent")
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(
            @Valid @RequestBody LoginRequest req,
            HttpServletRequest request
    ) {
        TokenResponse token = authService.authenticate(
                req,
                request.getRemoteAddr(),
                request.getHeader("User-Agent")
        );
        return ResponseEntity.ok(token);
    }

    @PostMapping(value = "/login/form", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<TokenResponse> loginForm(
            @RequestParam("username") String username,
            @RequestParam("password") String password,
            @RequestParam(value = "role", required = false) String role,
            HttpServletRequest request
    ) {
        LoginRequest req = new LoginRequest();
        req.setEmail(username);
        req.setPassword(password);
        req.setRole(role);

        TokenResponse token = authService.authenticate(
                req,
                request.getRemoteAddr(),
                request.getHeader("User-Agent")
        );
        return ResponseEntity.ok(token);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@RequestBody RefreshTokenRequest req) {
        TokenResponse token = authService.refreshToken(req.getRefreshToken());
        return ResponseEntity.ok(token);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User user = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        authService.logout(authHeader, user, request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.ok(Map.of("message", "Successfully logged out and token invalidated."));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ResourceNotFoundException("User not authenticated");
        }
        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(authService.toUserResponse(user));
    }
}

