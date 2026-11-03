package com.medicare360.controller;

import com.medicare360.dto.AppointmentCreateRequest;
import com.medicare360.dto.AppointmentResponse;
import com.medicare360.dto.AppointmentStatusUpdateRequest;
import com.medicare360.dto.AppointmentUpdateRequest;
import com.medicare360.entity.User;
import com.medicare360.repository.UserRepository;
import com.medicare360.security.UserPrincipal;
import com.medicare360.service.AppointmentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final UserRepository userRepository;

    public AppointmentController(AppointmentService appointmentService, UserRepository userRepository) {
        this.appointmentService = appointmentService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('RECEPTIONIST') or hasAuthority('DOCTOR') or hasAuthority('PATIENT')")
    public ResponseEntity<AppointmentResponse> createAppointment(
            @Valid @RequestBody AppointmentCreateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        AppointmentResponse res = appointmentService.create(req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AppointmentResponse>> listAppointments(
            @RequestParam(value = "skip", defaultValue = "0") int skip,
            @RequestParam(value = "limit", defaultValue = "50") int limit,
            @RequestParam(value = "patient_id", required = false) Long patientId,
            @RequestParam(value = "doctor_id", required = false) Long doctorId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "appointment_date", required = false) String appointmentDate
    ) {
        return ResponseEntity.ok(appointmentService.getMulti(skip, limit, patientId, doctorId, status, appointmentDate));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AppointmentResponse> getAppointment(@PathVariable("id") Long id) {
        return ResponseEntity.ok(appointmentService.getById(id));
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.PUT, RequestMethod.PATCH})
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('RECEPTIONIST') or hasAuthority('DOCTOR')")
    public ResponseEntity<AppointmentResponse> updateAppointment(
            @PathVariable("id") Long id,
            @RequestBody AppointmentUpdateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        return ResponseEntity.ok(appointmentService.update(id, req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent")));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('RECEPTIONIST') or hasAuthority('DOCTOR') or hasAuthority('NURSE')")
    public ResponseEntity<AppointmentResponse> updateAppointmentStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody AppointmentStatusUpdateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        return ResponseEntity.ok(appointmentService.updateStatus(id, req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent")));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('RECEPTIONIST')")
    public ResponseEntity<Void> deleteAppointment(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        appointmentService.delete(id, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.ok().build();
    }
}

