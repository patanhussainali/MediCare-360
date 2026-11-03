package com.medicare360.controller;

import com.medicare360.dto.PatientCreateRequest;
import com.medicare360.dto.PatientResponse;
import com.medicare360.dto.PatientUpdateRequest;
import com.medicare360.entity.User;
import com.medicare360.exception.ResourceNotFoundException;
import com.medicare360.repository.UserRepository;
import com.medicare360.security.UserPrincipal;
import com.medicare360.service.PatientService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/patients")
public class PatientController {

    private final PatientService patientService;
    private final UserRepository userRepository;

    public PatientController(PatientService patientService, UserRepository userRepository) {
        this.patientService = patientService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('RECEPTIONIST') or hasAuthority('DOCTOR') or hasAuthority('NURSE')")
    public ResponseEntity<PatientResponse> createPatient(
            @Valid @RequestBody PatientCreateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        PatientResponse res = patientService.create(req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('RECEPTIONIST') or hasAuthority('DOCTOR') or hasAuthority('NURSE')")
    public ResponseEntity<List<PatientResponse>> listPatients(
            @RequestParam(value = "skip", defaultValue = "0") int skip,
            @RequestParam(value = "limit", defaultValue = "50") int limit,
            @RequestParam(value = "search", required = false) String search
    ) {
        return ResponseEntity.ok(patientService.getMulti(skip, limit, search));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('PATIENT')")
    public ResponseEntity<PatientResponse> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ResourceNotFoundException("Not authenticated");
        }
        return ResponseEntity.ok(patientService.getByUserId(principal.getUserId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PatientResponse> getPatient(@PathVariable("id") Long id) {
        return ResponseEntity.ok(patientService.getById(id));
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.PUT, RequestMethod.PATCH})
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('RECEPTIONIST') or hasAuthority('DOCTOR') or hasAuthority('NURSE')")
    public ResponseEntity<PatientResponse> updatePatient(
            @PathVariable("id") Long id,
            @Valid @RequestBody PatientUpdateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        return ResponseEntity.ok(patientService.update(id, req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent")));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deletePatient(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        patientService.delete(id, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.ok().build();
    }
}

