package com.medicare360.controller;

import com.medicare360.dto.*;
import com.medicare360.entity.User;
import com.medicare360.repository.UserRepository;
import com.medicare360.security.UserPrincipal;
import com.medicare360.service.PrescriptionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final UserRepository userRepository;

    public PrescriptionController(PrescriptionService prescriptionService, UserRepository userRepository) {
        this.prescriptionService = prescriptionService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('DOCTOR')")
    public ResponseEntity<PrescriptionResponse> createPrescription(
            @Valid @RequestBody PrescriptionCreateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        PrescriptionResponse res = prescriptionService.create(req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('DOCTOR') or hasAuthority('PHARMACIST') or hasAuthority('NURSE')")
    public ResponseEntity<List<PrescriptionResponse>> listPrescriptions(
            @RequestParam(value = "skip", defaultValue = "0") int skip,
            @RequestParam(value = "limit", defaultValue = "50") int limit,
            @RequestParam(value = "patient_id", required = false) String patientId,
            @RequestParam(value = "doctor_id", required = false) String doctorId
    ) {
        return ResponseEntity.ok(prescriptionService.getMulti(skip, limit, patientId, doctorId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PrescriptionResponse> getPrescription(@PathVariable("id") String id) {
        return ResponseEntity.ok(prescriptionService.getById(id));
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.PUT, RequestMethod.PATCH})
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('DOCTOR') or hasAuthority('PHARMACIST')")
    public ResponseEntity<PrescriptionResponse> updatePrescription(
            @PathVariable("id") String id,
            @RequestBody PrescriptionUpdateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        return ResponseEntity.ok(prescriptionService.update(id, req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent")));
    }

    @PostMapping("/{id}/items")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('DOCTOR')")
    public ResponseEntity<PrescriptionItemResponse> addPrescriptionItem(
            @PathVariable("id") String id,
            @Valid @RequestBody PrescriptionItemCreateRequest req,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        return ResponseEntity.status(HttpStatus.CREATED).body(prescriptionService.addItem(id, req, currentUser));
    }
}

