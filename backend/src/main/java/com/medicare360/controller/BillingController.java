package com.medicare360.controller;

import com.medicare360.dto.InvoiceCreateRequest;
import com.medicare360.dto.InvoiceResponse;
import com.medicare360.dto.InvoiceStatusUpdateRequest;
import com.medicare360.dto.InvoiceUpdateRequest;
import com.medicare360.entity.User;
import com.medicare360.repository.UserRepository;
import com.medicare360.security.UserPrincipal;
import com.medicare360.service.BillingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/billing")
public class BillingController {

    private final BillingService billingService;
    private final UserRepository userRepository;

    public BillingController(BillingService billingService, UserRepository userRepository) {
        this.billingService = billingService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('RECEPTIONIST') or hasAuthority('PHARMACIST')")
    public ResponseEntity<InvoiceResponse> createInvoice(
            @Valid @RequestBody InvoiceCreateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        InvoiceResponse res = billingService.create(req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('RECEPTIONIST') or hasAuthority('PHARMACIST') or hasAuthority('PATIENT')")
    public ResponseEntity<List<InvoiceResponse>> listInvoices(
            @RequestParam(value = "skip", defaultValue = "0") int skip,
            @RequestParam(value = "limit", defaultValue = "50") int limit,
            @RequestParam(value = "patient_id", required = false) String patientId,
            @RequestParam(value = "payment_status", required = false) String paymentStatus,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        return ResponseEntity.ok(billingService.getMulti(skip, limit, patientId, paymentStatus, currentUser));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InvoiceResponse> getInvoice(@PathVariable("id") String id) {
        return ResponseEntity.ok(billingService.getById(id));
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.PUT, RequestMethod.PATCH})
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('RECEPTIONIST')")
    public ResponseEntity<InvoiceResponse> updateInvoice(
            @PathVariable("id") String id,
            @RequestBody InvoiceUpdateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        return ResponseEntity.ok(billingService.update(id, req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent")));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('RECEPTIONIST') or hasAuthority('PHARMACIST') or hasAuthority('PATIENT')")
    public ResponseEntity<InvoiceResponse> updateInvoiceStatus(
            @PathVariable("id") String id,
            @RequestBody InvoiceStatusUpdateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        return ResponseEntity.ok(billingService.updateStatus(id, req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent")));
    }
}

