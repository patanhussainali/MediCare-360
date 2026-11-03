package com.medicare360.controller;

import com.medicare360.dto.*;
import com.medicare360.entity.User;
import com.medicare360.repository.UserRepository;
import com.medicare360.security.UserPrincipal;
import com.medicare360.service.StaffService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/staff")
public class StaffController {

    private final StaffService staffService;
    private final UserRepository userRepository;

    public StaffController(StaffService staffService, UserRepository userRepository) {
        this.staffService = staffService;
        this.userRepository = userRepository;
    }

    // Nurses
    @PostMapping("/nurses")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<NurseResponse> createNurse(
            @Valid @RequestBody NurseCreateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        NurseResponse res = staffService.createNurse(req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping("/nurses")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<NurseResponse>> listNurses(
            @RequestParam(value = "skip", defaultValue = "0") int skip,
            @RequestParam(value = "limit", defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(staffService.getNurses(skip, limit));
    }

    @GetMapping("/nurses/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<NurseResponse> getNurse(@PathVariable("id") String id) {
        return ResponseEntity.ok(staffService.getNurseById(id));
    }

    // Receptionists
    @PostMapping("/receptionists")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ReceptionistResponse> createReceptionist(
            @Valid @RequestBody ReceptionistCreateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        ReceptionistResponse res = staffService.createReceptionist(req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping("/receptionists")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<ReceptionistResponse>> listReceptionists(
            @RequestParam(value = "skip", defaultValue = "0") int skip,
            @RequestParam(value = "limit", defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(staffService.getReceptionists(skip, limit));
    }

    // Pharmacists
    @PostMapping("/pharmacists")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<PharmacistResponse> createPharmacist(
            @Valid @RequestBody PharmacistCreateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        PharmacistResponse res = staffService.createPharmacist(req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping("/pharmacists")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<PharmacistResponse>> listPharmacists(
            @RequestParam(value = "skip", defaultValue = "0") int skip,
            @RequestParam(value = "limit", defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(staffService.getPharmacists(skip, limit));
    }

    // Schedules
    @PostMapping("/schedules")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<StaffScheduleResponse> createSchedule(
            @Valid @RequestBody StaffScheduleCreateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        StaffScheduleResponse res = staffService.createSchedule(req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping("/schedules")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StaffScheduleResponse>> listSchedules(
            @RequestParam(value = "skip", defaultValue = "0") int skip,
            @RequestParam(value = "limit", defaultValue = "50") int limit,
            @RequestParam(value = "staff_type", required = false) String staffType,
            @RequestParam(value = "day_of_week", required = false) String dayOfWeek
    ) {
        return ResponseEntity.ok(staffService.getSchedules(skip, limit, staffType, dayOfWeek));
    }
}

