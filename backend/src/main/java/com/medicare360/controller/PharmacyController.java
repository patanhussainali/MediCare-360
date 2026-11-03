package com.medicare360.controller;

import com.medicare360.dto.*;
import com.medicare360.entity.User;
import com.medicare360.repository.UserRepository;
import com.medicare360.security.UserPrincipal;
import com.medicare360.service.PharmacyService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pharmacy")
public class PharmacyController {

    private final PharmacyService pharmacyService;
    private final UserRepository userRepository;

    public PharmacyController(PharmacyService pharmacyService, UserRepository userRepository) {
        this.pharmacyService = pharmacyService;
        this.userRepository = userRepository;
    }

    @PostMapping("/medicines")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('PHARMACIST')")
    public ResponseEntity<MedicineResponse> createMedicine(
            @Valid @RequestBody MedicineCreateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        MedicineResponse res = pharmacyService.createMedicine(req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping("/medicines")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MedicineResponse>> listMedicines(
            @RequestParam(value = "skip", defaultValue = "0") int skip,
            @RequestParam(value = "limit", defaultValue = "50") int limit,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "category", required = false) String category
    ) {
        return ResponseEntity.ok(pharmacyService.getMedicines(skip, limit, search, category));
    }

    @GetMapping("/medicines/low-stock")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('PHARMACIST') or hasAuthority('NURSE')")
    public ResponseEntity<List<MedicineResponse>> getLowStockMedicines() {
        return ResponseEntity.ok(pharmacyService.getLowStockMedicines());
    }

    @GetMapping("/medicines/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MedicineResponse> getMedicine(@PathVariable("id") Long id) {
        return ResponseEntity.ok(pharmacyService.getMedicineById(id));
    }

    @RequestMapping(value = "/medicines/{id}", method = {RequestMethod.PUT, RequestMethod.PATCH})
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('PHARMACIST')")
    public ResponseEntity<MedicineResponse> updateMedicine(
            @PathVariable("id") Long id,
            @RequestBody MedicineUpdateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        return ResponseEntity.ok(pharmacyService.updateMedicine(id, req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent")));
    }

    @PatchMapping("/medicines/{id}/stock")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('PHARMACIST')")
    public ResponseEntity<MedicineResponse> updateStock(
            @PathVariable("id") Long id,
            @RequestBody MedicineStockUpdateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        return ResponseEntity.ok(pharmacyService.updateStock(id, req.getQuantityDelta(), currentUser, request.getRemoteAddr(), request.getHeader("User-Agent")));
    }

    @RequestMapping(value = {"/issue", "/dispense"}, method = RequestMethod.POST)
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('PHARMACIST')")
    public ResponseEntity<MedicineIssueResponse> issueMedicine(
            @RequestBody MedicineIssueCreateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        MedicineIssueResponse res = pharmacyService.issueMedicine(req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @RequestMapping(value = {"/issue", "/dispense"}, method = RequestMethod.GET)
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('PHARMACIST') or hasAuthority('NURSE')")
    public ResponseEntity<List<MedicineIssueResponse>> listIssueRecords(
            @RequestParam(value = "skip", defaultValue = "0") int skip,
            @RequestParam(value = "limit", defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(pharmacyService.getIssueRecords(skip, limit));
    }
}

