package com.medicare360.service;

import com.medicare360.dto.*;
import com.medicare360.entity.*;
import com.medicare360.exception.ResourceNotFoundException;
import com.medicare360.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final AuditService auditService;

    public PrescriptionService(PrescriptionRepository prescriptionRepository,
                                PatientRepository patientRepository,
                                DoctorRepository doctorRepository,
                                AppointmentRepository appointmentRepository,
                                AuditService auditService) {
        this.prescriptionRepository = prescriptionRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.auditService = auditService;
    }

    public List<PrescriptionResponse> getMulti(int skip, int limit, String patientId, String doctorId) {
        int page = limit > 0 ? skip / limit : 0;
        int size = limit > 0 ? limit : 50;
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Prescription> prescriptions = prescriptionRepository.findAll(pageable);
        return prescriptions.getContent().stream()
                .filter(p -> patientId == null || patientId.equals(p.getPatientId()))
                .filter(p -> doctorId == null || doctorId.equals(p.getDoctorId()))
                .map(this::toResponse)
                .toList();
    }

    public PrescriptionResponse getById(String id) {
        Prescription p = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));
        return toResponse(p);
    }

    public PrescriptionResponse create(PrescriptionCreateRequest req, User currentUser, String ipAddress, String userAgent) {
        Patient patient = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        Doctor doctor = doctorRepository.findById(req.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        Prescription p = new Prescription();
        p.setPrescriptionNumber("PRESC-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase());
        p.setPatientId(patient.getId());
        p.setPatientName(patient.getFullName());
        p.setDoctorId(doctor.getId());
        p.setDoctorName(doctor.getFullName());

        if (req.getAppointmentId() != null && !req.getAppointmentId().isBlank()) {
            appointmentRepository.findById(req.getAppointmentId())
                    .ifPresent(apt -> p.setAppointmentId(apt.getId()));
        }

        p.setDiagnosis(req.getDiagnosis());
        p.setInstructions(req.getInstructions());
        p.setStatus("Active");

        List<PrescriptionItem> items = new ArrayList<>();
        if (req.getItems() != null) {
            for (PrescriptionItemCreateRequest itemReq : req.getItems()) {
                PrescriptionItem item = new PrescriptionItem();
                item.setMedicineName(itemReq.getMedicineName());
                item.setDosage(itemReq.getDosage());
                item.setFrequency(itemReq.getFrequency());
                item.setDuration(itemReq.getDuration());
                item.setInstructions(itemReq.getInstructions());
                items.add(item);
            }
        }
        p.setItems(items);

        prescriptionRepository.save(p);

        auditService.logAction("PRESCRIPTION_CREATED", "Prescription", currentUser, p.getId(),
                Map.of("patient_id", patient.getId(), "items_count", items.size()),
                ipAddress, userAgent);
        return toResponse(p);
    }

    public PrescriptionResponse update(String id, PrescriptionUpdateRequest req, User currentUser, String ipAddress, String userAgent) {
        Prescription p = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));

        if (req.getDiagnosis() != null) p.setDiagnosis(req.getDiagnosis());
        if (req.getInstructions() != null) p.setInstructions(req.getInstructions());
        if (req.getStatus() != null) p.setStatus(req.getStatus());

        prescriptionRepository.save(p);
        auditService.logAction("PRESCRIPTION_UPDATED", "Prescription", currentUser, p.getId(),
                Map.of("id", p.getId()), ipAddress, userAgent);
        return toResponse(p);
    }

    public PrescriptionItemResponse addItem(String prescriptionId, PrescriptionItemCreateRequest itemReq, User currentUser) {
        Prescription p = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));

        PrescriptionItem item = new PrescriptionItem();
        item.setMedicineName(itemReq.getMedicineName());
        item.setDosage(itemReq.getDosage());
        item.setFrequency(itemReq.getFrequency());
        item.setDuration(itemReq.getDuration());
        item.setInstructions(itemReq.getInstructions());

        p.getItems().add(item);
        prescriptionRepository.save(p);
        return toItemResponse(item);
    }

    public PrescriptionResponse toResponse(Prescription p) {
        PrescriptionResponse res = new PrescriptionResponse();
        res.setId(p.getId());
        res.setPrescriptionNumber(p.getPrescriptionNumber());
        res.setPatientId(p.getPatientId());
        res.setPatientName(p.getPatientName());
        res.setDoctorId(p.getDoctorId());
        res.setDoctorName(p.getDoctorName());
        res.setAppointmentId(p.getAppointmentId());
        res.setDiagnosis(p.getDiagnosis());
        res.setInstructions(p.getInstructions());
        res.setStatus(p.getStatus());
        res.setCreatedAt(p.getCreatedAt());
        res.setUpdatedAt(p.getUpdatedAt());
        res.setItems(p.getItems() != null
                ? p.getItems().stream().map(this::toItemResponse).toList()
                : List.of());
        return res;
    }

    public PrescriptionItemResponse toItemResponse(PrescriptionItem item) {
        PrescriptionItemResponse res = new PrescriptionItemResponse();
        res.setMedicineName(item.getMedicineName());
        res.setDosage(item.getDosage());
        res.setFrequency(item.getFrequency());
        res.setDuration(item.getDuration());
        res.setInstructions(item.getInstructions());
        return res;
    }
}
