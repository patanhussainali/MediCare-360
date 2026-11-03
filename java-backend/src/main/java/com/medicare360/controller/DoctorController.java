package com.medicare360.controller;

import com.medicare360.dto.DoctorCreateRequest;
import com.medicare360.dto.DoctorResponse;
import com.medicare360.dto.DoctorUpdateRequest;
import com.medicare360.entity.User;
import com.medicare360.repository.UserRepository;
import com.medicare360.security.UserPrincipal;
import com.medicare360.service.DoctorService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/doctors")
public class DoctorController {

    private final DoctorService doctorService;
    private final UserRepository userRepository;

    public DoctorController(DoctorService doctorService, UserRepository userRepository) {
        this.doctorService = doctorService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<DoctorResponse> createDoctor(
            @Valid @RequestBody DoctorCreateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        DoctorResponse res = doctorService.create(req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DoctorResponse>> listDoctors(
            @RequestParam(value = "skip", defaultValue = "0") int skip,
            @RequestParam(value = "limit", defaultValue = "50") int limit,
            @RequestParam(value = "department_id", required = false) Long departmentId,
            @RequestParam(value = "is_available", required = false) Boolean isAvailable
    ) {
        return ResponseEntity.ok(doctorService.getMulti(skip, limit, departmentId, isAvailable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DoctorResponse> getDoctor(@PathVariable("id") Long id) {
        return ResponseEntity.ok(doctorService.getById(id));
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.PUT, RequestMethod.PATCH})
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<DoctorResponse> updateDoctor(
            @PathVariable("id") Long id,
            @Valid @RequestBody DoctorUpdateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        return ResponseEntity.ok(doctorService.update(id, req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent")));
    }
}

