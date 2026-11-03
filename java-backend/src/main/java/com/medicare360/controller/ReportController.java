package com.medicare360.controller;

import com.medicare360.dto.*;
import com.medicare360.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/patients")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('DOCTOR')")
    public ResponseEntity<PatientStatsResponse> patientStatistics() {
        return ResponseEntity.ok(reportService.getPatientStats());
    }

    @GetMapping("/appointments")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('DOCTOR') or hasAuthority('RECEPTIONIST')")
    public ResponseEntity<AppointmentStatsResponse> appointmentStatistics() {
        return ResponseEntity.ok(reportService.getAppointmentStats());
    }

    @GetMapping("/billing")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('RECEPTIONIST')")
    public ResponseEntity<BillingStatsResponse> billingStatistics() {
        return ResponseEntity.ok(reportService.getBillingStats());
    }

    @GetMapping("/pharmacy")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('PHARMACIST')")
    public ResponseEntity<PharmacyStatsResponse> pharmacyStatistics() {
        return ResponseEntity.ok(reportService.getPharmacyStats());
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<DashboardStatsResponse> dashboardStatistics() {
        return ResponseEntity.ok(reportService.getDashboardStats());
    }
}

