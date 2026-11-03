package com.medicare360.controller;

import com.medicare360.dto.UserCreateRequest;
import com.medicare360.dto.UserResponse;
import com.medicare360.dto.UserUpdateRequest;
import com.medicare360.entity.User;
import com.medicare360.exception.ResourceNotFoundException;
import com.medicare360.repository.UserRepository;
import com.medicare360.security.UserPrincipal;
import com.medicare360.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ResourceNotFoundException("User not authenticated");
        }
        return ResponseEntity.ok(userService.getUserById(principal.getUserId()));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody UserCreateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        UserResponse response = userService.createUser(req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<UserResponse>> listUsers(
            @RequestParam(value = "skip", defaultValue = "0") int skip,
            @RequestParam(value = "limit", defaultValue = "100") int limit,
            @RequestParam(value = "role", required = false) String role
    ) {
        return ResponseEntity.ok(userService.listUsers(skip, limit, role));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserResponse> getUser(@PathVariable("id") Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable("id") Long id,
            @Valid @RequestBody UserUpdateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        UserResponse response = userService.updateUser(id, req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteUser(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userService.deleteUser(id, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.noContent().build();
    }
}

