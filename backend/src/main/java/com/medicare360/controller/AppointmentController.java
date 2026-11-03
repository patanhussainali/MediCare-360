package com.medicare360.controller;

import com.medicare360.dto.AppointmentCreateRequest;
import com.medicare360.dto.AppointmentResponse;
import com.medicare360.dto.AppointmentStatusUpdateRequest;
import com.medicare360.dto.AppointmentUpdateRequest;
import com.medicare360.entity.User;
import com.medicare360.entity.Doctor;
import com.medicare360.entity.Patient;
import com.medicare360.exception.ForbiddenException;
import com.medicare360.repository.DoctorRepository;
import com.medicare360.repository.PatientRepository;
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
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public AppointmentController(AppointmentService appointmentService, UserRepository userRepository,
                                 PatientRepository patientRepository, DoctorRepository doctorRepository) {
        this.appointmentService = appointmentService;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('RECEPTIONIST') or hasAuthority('DOCTOR') or hasAuthority('PATIENT')")
    public ResponseEntity<AppointmentResponse> createAppointment(
            @Valid @RequestBody AppointmentCreateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        if (currentUser == null || currentUser.getRole() == null) throw new ForbiddenException("Authentication is required");
        if (currentUser.getRole().name().equals("PATIENT")) {
            Patient patient = patientRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new ForbiddenException("Patient profile is not linked to this account"));
            if (!patient.getId().equals(req.getPatientId())) throw new ForbiddenException("You can only book appointments for your own patient profile");
        } else if (currentUser.getRole().name().equals("DOCTOR")) {
            Doctor doctor = doctorRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new ForbiddenException("Doctor profile is not linked to this account"));
            req.setDoctorId(doctor.getId());
        } else if (!List.of("ADMIN", "RECEPTIONIST").contains(currentUser.getRole().name())) {
            throw new ForbiddenException("This role cannot create appointments");
        }
        AppointmentResponse res = appointmentService.create(req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AppointmentResponse>> listAppointments(
            @RequestParam(value = "skip", defaultValue = "0") int skip,
            @RequestParam(value = "limit", defaultValue = "50") int limit,
            @RequestParam(value = "patient_id", required = false) String patientId,
            @RequestParam(value = "doctor_id", required = false) String doctorId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "appointment_date", required = false) String appointmentDate,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = requireUser(principal);
        String role = user.getRole() == null ? "" : user.getRole().name();
        if ("PATIENT".equals(role)) {
            Patient patient = patientRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ForbiddenException("Patient profile is not linked to this account"));
            if (patientId != null && !patientId.equals(patient.getId())) throw new ForbiddenException("You can only view your own appointments");
            patientId = patient.getId();
        } else if ("DOCTOR".equals(role)) {
            Doctor doctor = doctorRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ForbiddenException("Doctor profile is not linked to this account"));
            if (doctorId != null && !doctorId.equals(doctor.getId())) throw new ForbiddenException("You can only view your own appointments");
            doctorId = doctor.getId();
        } else if (!List.of("ADMIN", "RECEPTIONIST", "NURSE").contains(role)) {
            throw new ForbiddenException("This role cannot access appointments");
        }
        return ResponseEntity.ok(appointmentService.getMulti(skip, limit, patientId, doctorId, status, appointmentDate));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AppointmentResponse> getAppointment(@PathVariable("id") String id,
                                                               @AuthenticationPrincipal UserPrincipal principal) {
        User user = requireUser(principal);
        AppointmentResponse appointment = appointmentService.getById(id);
        String role = user.getRole() == null ? "" : user.getRole().name();
        boolean allowed = List.of("ADMIN", "RECEPTIONIST", "NURSE").contains(role)
                || ("PATIENT".equals(role) && patientRepository.findByUserId(user.getId()).map(p -> p.getId().equals(appointment.getPatientId())).orElse(false))
                || ("DOCTOR".equals(role) && doctorRepository.findByUserId(user.getId()).map(d -> d.getId().equals(appointment.getDoctorId())).orElse(false));
        if (!allowed) throw new ForbiddenException("You cannot access this appointment");
        return ResponseEntity.ok(appointment);
    }

    private User requireUser(UserPrincipal principal) {
        if (principal == null) throw new ForbiddenException("Authentication is required");
        return userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new ForbiddenException("User account is not available"));
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.PUT, RequestMethod.PATCH})
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('RECEPTIONIST') or hasAuthority('DOCTOR')")
    public ResponseEntity<AppointmentResponse> updateAppointment(
            @PathVariable("id") String id,
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
            @PathVariable("id") String id,
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
            @PathVariable("id") String id,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        appointmentService.delete(id, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.ok().build();
    }
}

