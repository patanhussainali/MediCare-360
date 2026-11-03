package com.medicare360.controller;

import com.medicare360.dto.MedicalRecordCreateRequest;
import com.medicare360.dto.MedicalRecordResponse;
import com.medicare360.dto.MedicalRecordUpdateRequest;
import com.medicare360.entity.User;
import com.medicare360.repository.UserRepository;
import com.medicare360.security.UserPrincipal;
import com.medicare360.service.MedicalRecordService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/medical-records")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;
    private final UserRepository userRepository;

    public MedicalRecordController(MedicalRecordService medicalRecordService, UserRepository userRepository) {
        this.medicalRecordService = medicalRecordService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('DOCTOR') or hasAuthority('NURSE')")
    public ResponseEntity<MedicalRecordResponse> createMedicalRecord(
            @Valid @RequestBody MedicalRecordCreateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        MedicalRecordResponse res = medicalRecordService.create(req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('DOCTOR') or hasAuthority('NURSE') or hasAnyAuthority('LAB_TECHNICIAN', 'ROLE_LAB_TECHNICIAN')")
    public ResponseEntity<List<MedicalRecordResponse>> listMedicalRecords(
            @RequestParam(value = "skip", defaultValue = "0") int skip,
            @RequestParam(value = "limit", defaultValue = "50") int limit,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        return ResponseEntity.ok(medicalRecordService.getMulti(skip, limit, currentUser));
    }

    @GetMapping("/patient/{patient_id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MedicalRecordResponse>> getPatientMedicalHistory(
            @PathVariable("patient_id") Long patientId,
            @RequestParam(value = "skip", defaultValue = "0") int skip,
            @RequestParam(value = "limit", defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(medicalRecordService.getPatientHistory(patientId, skip, limit));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MedicalRecordResponse> getMedicalRecord(@PathVariable("id") Long id) {
        return ResponseEntity.ok(medicalRecordService.getById(id));
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.PUT, RequestMethod.PATCH})
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('DOCTOR') or hasAuthority('LAB_TECHNICIAN')")
    public ResponseEntity<MedicalRecordResponse> updateMedicalRecord(
            @PathVariable("id") Long id,
            @RequestBody MedicalRecordUpdateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        return ResponseEntity.ok(medicalRecordService.update(id, req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent")));
    }
}

