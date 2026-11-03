package com.medicare360.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicare360.dto.*;
import com.medicare360.entity.*;
import com.medicare360.exception.ResourceNotFoundException;
import com.medicare360.repository.AppointmentRepository;
import com.medicare360.repository.InvoiceRepository;
import com.medicare360.repository.PatientRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    public BillingService(
            InvoiceRepository invoiceRepository,
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository,
            AuditService auditService,
            ObjectMapper objectMapper
    ) {
        this.invoiceRepository = invoiceRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.auditService = auditService;
        this.objectMapper = objectMapper;
    }

    public static String generateInvoiceNumber() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randNum = 1000 + new Random().nextInt(9000);
        return "INV-" + dateStr + "-" + randNum;
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getMulti(int skip, int limit, Long patientId, String paymentStatusStr, User currentUser) {
        if (currentUser != null && currentUser.getRole() == UserRole.PATIENT) {
            patientId = patientRepository.findByUserId(currentUser.getId()).map(Patient::getId).orElse(-1L);
        }
        Long scopedPatientId = patientId;
        int page = limit > 0 ? skip / limit : 0;
        int size = limit > 0 ? limit : 50;
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Invoice> invoices = invoiceRepository.findAll(pageable);
        return invoices.getContent().stream()
                .filter(i -> scopedPatientId == null || (i.getPatient() != null && i.getPatient().getId().equals(scopedPatientId)))
                .filter(i -> paymentStatusStr == null || (i.getPaymentStatus() != null && i.getPaymentStatus().getDbValue().equalsIgnoreCase(paymentStatusStr)))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        return toResponse(invoice);
    }

    @Transactional
    public InvoiceResponse create(InvoiceCreateRequest req, User currentUser, String ipAddress, String userAgent) {
        Patient patient = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Appointment apt = null;
        if (req.getAppointmentId() != null) {
            apt = appointmentRepository.findById(req.getAppointmentId()).orElse(null);
        }

        String invNum = generateInvoiceNumber();
        while (invoiceRepository.findByInvoiceNumber(invNum).isPresent()) {
            invNum = generateInvoiceNumber();
        }

        double subtotal = req.getSubtotal() != null ? req.getSubtotal() : 0.0;
        double tax = req.getTax() != null ? req.getTax() : 0.0;
        double discount = req.getDiscount() != null ? req.getDiscount() : 0.0;
        double total = req.getTotalAmount() != null && req.getTotalAmount() > 0 ? req.getTotalAmount() : Math.max(0.0, subtotal + tax - discount);

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(invNum);
        invoice.setPatient(patient);
        invoice.setAppointment(apt);
        invoice.setDescription(req.getDescription());
        invoice.setSubtotal(subtotal);
        invoice.setTax(tax);
        invoice.setDiscount(discount);
        invoice.setTotalAmount(total);

        PaymentStatus status = PaymentStatus.PENDING;
        if (req.getPaymentStatus() != null && !req.getPaymentStatus().isBlank()) {
            status = PaymentStatus.fromDbValue(req.getPaymentStatus());
        }
        invoice.setPaymentStatus(status);
        invoice.setPaymentMethod(req.getPaymentMethod());
        invoice.setNotes(req.getNotes());

        if (status == PaymentStatus.PAID) {
            invoice.setPaidAt(Instant.now());
        }

        if (req.getItems() != null) {
            try {
                invoice.setItemsJson(objectMapper.writeValueAsString(req.getItems()));
            } catch (Exception e) {
                invoice.setItemsJson("[]");
            }
        }

        invoice = invoiceRepository.save(invoice);

        auditService.logAction(
                "INVOICE_CREATED",
                "Invoice",
                currentUser,
                invoice.getId().toString(),
                Map.of("invoice_number", invoice.getInvoiceNumber(), "total", invoice.getTotalAmount()),
                ipAddress,
                userAgent
        );

        return toResponse(invoice);
    }

    @Transactional
    public InvoiceResponse update(Long id, InvoiceUpdateRequest req, User currentUser, String ipAddress, String userAgent) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        if (req.getDescription() != null) invoice.setDescription(req.getDescription());
        if (req.getSubtotal() != null) invoice.setSubtotal(req.getSubtotal());
        if (req.getTax() != null) invoice.setTax(req.getTax());
        if (req.getDiscount() != null) invoice.setDiscount(req.getDiscount());
        if (req.getTotalAmount() != null) invoice.setTotalAmount(req.getTotalAmount());
        if (req.getPaymentMethod() != null) invoice.setPaymentMethod(req.getPaymentMethod());
        if (req.getNotes() != null) invoice.setNotes(req.getNotes());

        if (req.getPaymentStatus() != null && !req.getPaymentStatus().isBlank()) {
            PaymentStatus newStatus = PaymentStatus.fromDbValue(req.getPaymentStatus());
            invoice.setPaymentStatus(newStatus);
            if (newStatus == PaymentStatus.PAID && invoice.getPaidAt() == null) {
                invoice.setPaidAt(Instant.now());
            }
        }

        if (req.getItems() != null) {
            try {
                invoice.setItemsJson(objectMapper.writeValueAsString(req.getItems()));
            } catch (Exception e) {
                invoice.setItemsJson("[]");
            }
        }

        invoice = invoiceRepository.save(invoice);

        auditService.logAction(
                "INVOICE_UPDATED",
                "Invoice",
                currentUser,
                invoice.getId().toString(),
                Map.of("id", invoice.getId()),
                ipAddress,
                userAgent
        );

        return toResponse(invoice);
    }

    @Transactional
    public InvoiceResponse updateStatus(Long id, InvoiceStatusUpdateRequest req, User currentUser, String ipAddress, String userAgent) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        PaymentStatus oldStatus = invoice.getPaymentStatus();
        PaymentStatus newStatus = PaymentStatus.fromDbValue(req.getPaymentStatus());
        if (currentUser != null && currentUser.getRole() == UserRole.PATIENT) {
            Long ownPatientId = patientRepository.findByUserId(currentUser.getId()).map(Patient::getId).orElse(-1L);
            if (invoice.getPatient() == null || !ownPatientId.equals(invoice.getPatient().getId()) || newStatus != PaymentStatus.PAID) {
                throw new com.medicare360.exception.ForbiddenException("Patients can pay only their own invoices.");
            }
        }
        invoice.setPaymentStatus(newStatus);

        if (req.getPaymentMethod() != null) {
            invoice.setPaymentMethod(req.getPaymentMethod());
        }
        if (newStatus == PaymentStatus.PAID && invoice.getPaidAt() == null) {
            invoice.setPaidAt(Instant.now());
        }

        invoice = invoiceRepository.save(invoice);

        auditService.logAction(
                "INVOICE_STATUS_UPDATED",
                "Invoice",
                currentUser,
                invoice.getId().toString(),
                Map.of("from", oldStatus != null ? oldStatus.getDbValue() : "", "to", newStatus.getDbValue()),
                ipAddress,
                userAgent
        );

        return toResponse(invoice);
    }

    public InvoiceResponse toResponse(Invoice inv) {
        InvoiceResponse res = new InvoiceResponse();
        res.setId(inv.getId());
        res.setInvoiceNumber(inv.getInvoiceNumber());
        if (inv.getPatient() != null) {
            res.setPatientId(inv.getPatient().getId());
            res.setPatientName(inv.getPatient().getFullName());
        }
        if (inv.getAppointment() != null) {
            res.setAppointmentId(inv.getAppointment().getId());
        }
        res.setDescription(inv.getDescription());
        res.setSubtotal(inv.getSubtotal());
        res.setTax(inv.getTax());
        res.setDiscount(inv.getDiscount());
        res.setTotalAmount(inv.getTotalAmount());
        res.setPaymentStatus(inv.getPaymentStatus() != null ? inv.getPaymentStatus().getDbValue() : "Pending");
        res.setPaymentMethod(inv.getPaymentMethod());
        res.setPaidAt(inv.getPaidAt());
        res.setNotes(inv.getNotes());
        res.setCreatedAt(inv.getCreatedAt());
        res.setUpdatedAt(inv.getUpdatedAt());

        if (inv.getItemsJson() != null) {
            try {
                res.setItems(objectMapper.readValue(inv.getItemsJson(), new TypeReference<List<Object>>() {}));
            } catch (Exception e) {
                res.setItems(new ArrayList<>());
            }
        }
        return res;
    }
}
