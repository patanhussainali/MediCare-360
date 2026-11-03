package com.medicare360.service;

import com.medicare360.dto.*;
import com.medicare360.entity.Appointment;
import com.medicare360.entity.Invoice;
import com.medicare360.entity.Medicine;
import com.medicare360.entity.Patient;
import com.medicare360.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final InvoiceRepository invoiceRepository;
    private final MedicineRepository medicineRepository;
    private final MedicineIssueRecordRepository medicineIssueRecordRepository;

    public ReportService(
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository,
            InvoiceRepository invoiceRepository,
            MedicineRepository medicineRepository,
            MedicineIssueRecordRepository medicineIssueRecordRepository
    ) {
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.invoiceRepository = invoiceRepository;
        this.medicineRepository = medicineRepository;
        this.medicineIssueRecordRepository = medicineIssueRecordRepository;
    }

    @Transactional(readOnly = true)
    public PatientStatsResponse getPatientStats() {
        List<Patient> patients = patientRepository.findAll();
        long total = patients.size();

        Map<String, Long> genderDist = patients.stream()
                .collect(Collectors.groupingBy(p -> p.getGender() != null ? p.getGender() : "Unknown", Collectors.counting()));

        Map<String, Long> bgDist = patients.stream()
                .collect(Collectors.groupingBy(p -> p.getBloodGroup() != null ? p.getBloodGroup() : "Unknown", Collectors.counting()));

        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);
        long newPatients = patients.stream()
                .filter(p -> p.getCreatedAt() != null && p.getCreatedAt().isAfter(thirtyDaysAgo))
                .count();

        return new PatientStatsResponse(total, genderDist, bgDist, newPatients);
    }

    @Transactional(readOnly = true)
    public AppointmentStatsResponse getAppointmentStats() {
        List<Appointment> appointments = appointmentRepository.findAll();
        long total = appointments.size();

        Map<String, Long> byStatus = appointments.stream()
                .collect(Collectors.groupingBy(a -> a.getStatus() != null ? a.getStatus().getDbValue() : "Scheduled", Collectors.counting()));

        String today = LocalDate.now().toString();
        long todayCount = appointments.stream()
                .filter(a -> today.equals(a.getAppointmentDate()))
                .count();

        long upcomingCount = appointments.stream()
                .filter(a -> a.getAppointmentDate() != null && a.getAppointmentDate().compareTo(today) > 0)
                .count();

        return new AppointmentStatsResponse(total, byStatus, todayCount, upcomingCount);
    }

    @Transactional(readOnly = true)
    public BillingStatsResponse getBillingStats() {
        List<Invoice> invoices = invoiceRepository.findAll();
        long count = invoices.size();

        double totalInvoiced = invoices.stream().mapToDouble(Invoice::getTotalAmount).sum();
        double totalPaid = invoices.stream()
                .filter(i -> i.getPaymentStatus() != null && "Paid".equalsIgnoreCase(i.getPaymentStatus().getDbValue()))
                .mapToDouble(Invoice::getTotalAmount).sum();
        double totalPending = invoices.stream()
                .filter(i -> i.getPaymentStatus() != null && "Pending".equalsIgnoreCase(i.getPaymentStatus().getDbValue()))
                .mapToDouble(Invoice::getTotalAmount).sum();

        Map<String, Long> byStatus = invoices.stream()
                .collect(Collectors.groupingBy(i -> i.getPaymentStatus() != null ? i.getPaymentStatus().getDbValue() : "Pending", Collectors.counting()));

        return new BillingStatsResponse(totalInvoiced, totalPaid, totalPending, byStatus, count);
    }

    @Transactional(readOnly = true)
    public PharmacyStatsResponse getPharmacyStats() {
        List<Medicine> medicines = medicineRepository.findAll();
        long total = medicines.size();
        long lowStock = medicines.stream()
                .filter(m -> m.getStockQuantity() <= m.getMinStockThreshold() && m.getStockQuantity() > 0)
                .count();
        long outOfStock = medicines.stream()
                .filter(m -> m.getStockQuantity() == 0)
                .count();

        long totalDispensed = medicineIssueRecordRepository.findAll().stream()
                .mapToLong(r -> r.getQuantity())
                .sum();

        return new PharmacyStatsResponse(total, lowStock, outOfStock, totalDispensed);
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        return new DashboardStatsResponse(
                getPatientStats(),
                getAppointmentStats(),
                getBillingStats(),
                getPharmacyStats()
        );
    }
}

