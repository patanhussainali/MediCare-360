package com.medicare360.service;

import com.medicare360.dto.MedicalRecordCreateRequest;
import com.medicare360.dto.MedicalRecordResponse;
import com.medicare360.dto.MedicalRecordUpdateRequest;
import com.medicare360.entity.*;
import com.medicare360.exception.BadRequestException;
import com.medicare360.exception.ForbiddenException;
import com.medicare360.exception.ResourceNotFoundException;
import com.medicare360.repository.DoctorRepository;
import com.medicare360.repository.MedicalRecordRepository;
import com.medicare360.repository.PatientRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class MedicalRecordService {

    private static final Pattern LAB_REFERRAL_MARKER = Pattern.compile("\\\"kind\\\"\\s*:\\s*\\\"LAB_REFERRAL\\\"", Pattern.CASE_INSENSITIVE);
    private static final Pattern LAB_TEST_LIST = Pattern.compile("\\\"tests\\\"\\s*:\\s*\\[\\s*\\\"[^\\\"]+\\\"", Pattern.CASE_INSENSITIVE);

    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AuditService auditService;

    public MedicalRecordService(MedicalRecordRepository medicalRecordRepository, PatientRepository patientRepository,
                                 DoctorRepository doctorRepository, AuditService auditService) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.auditService = auditService;
    }

    public List<MedicalRecordResponse> getMulti(int skip, int limit, User currentUser) {
        int size = limit > 0 ? limit : 50;
        int page = Math.max(0, skip) / size;
        Pageable pageable = PageRequest.of(page, size);

        if (currentUser != null && currentUser.getRole() == UserRole.LAB_TECHNICIAN) {
            return medicalRecordRepository.findLabReferrals(pageable).getContent().stream()
                    .map(this::toResponse).toList();
        }

        List<MedicalRecord> records = medicalRecordRepository.findAll(Sort.by("createdAt").descending());
        String scopedDoctorId = null;
        if (currentUser != null && currentUser.getRole() == UserRole.DOCTOR) {
            scopedDoctorId = doctorRepository.findByUserId(currentUser.getId())
                    .map(Doctor::getId).orElse("-1");
        }
        final String filteredDoctorId = scopedDoctorId;
        return records.stream()
                .filter(r -> filteredDoctorId == null || filteredDoctorId.equals(r.getDoctorId()))
                .skip(Math.max(0, skip))
                .limit(size)
                .map(this::toResponse).toList();
    }

    public List<MedicalRecordResponse> getPatientHistory(String patientId, int skip, int limit) {
        patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        int page = limit > 0 ? skip / limit : 0;
        int size = limit > 0 ? limit : 50;
        Pageable pageable = PageRequest.of(page, size);
        return medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(patientId, pageable)
                .getContent().stream().map(this::toResponse).toList();
    }

    public MedicalRecordResponse getById(String id) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));
        return toResponse(record);
    }

    public MedicalRecordResponse create(MedicalRecordCreateRequest req, User currentUser, String ipAddress, String userAgent) {
        Patient patient = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Doctor doctor = null;
        if (currentUser != null && currentUser.getRole() == UserRole.DOCTOR) {
            doctor = doctorRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new BadRequestException("A doctor profile is required to create this medical record."));
            if (req.getDoctorId() != null && !doctor.getId().equals(req.getDoctorId())) {
                throw new ForbiddenException("Doctors can create records only under their own profile.");
            }
        } else if (req.getDoctorId() != null) {
            doctor = doctorRepository.findById(req.getDoctorId()).orElse(null);
        }

        MedicalRecord record = new MedicalRecord();
        record.setRecordNumber("REC-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase());
        record.setPatientId(patient.getId());
        record.setPatientName(patient.getFullName());
        record.setPatientCode(patient.getPatientId());
        if (doctor != null) {
            record.setDoctorId(doctor.getId());
            record.setDoctorName(doctor.getFullName());
        }
        record.setDiagnosis(req.getDiagnosis());
        record.setSymptoms(req.getSymptoms());
        record.setExaminationNotes(req.getExaminationNotes());
        record.setVitalSigns(req.getVitalSigns());
        record.setAttachments(req.getAttachments());
        record.setVisitDate(req.getVisitDate());

        if (isLabReferral(record)) {
            if (doctor == null) throw new BadRequestException("A referring doctor is required for a laboratory referral.");
            if (record.getExaminationNotes() == null
                    || !LAB_REFERRAL_MARKER.matcher(record.getExaminationNotes()).find()
                    || !LAB_TEST_LIST.matcher(record.getExaminationNotes()).find()) {
                throw new BadRequestException("Select at least one laboratory test before submitting the referral.");
            }
        }

        record = medicalRecordRepository.save(record);
        auditService.logAction("MEDICAL_RECORD_CREATED", "MedicalRecord", currentUser, record.getId(),
                Map.of("patient_id", patient.getId(), "diagnosis", String.valueOf(record.getDiagnosis())),
                ipAddress, userAgent);
        return toResponse(record);
    }

    public MedicalRecordResponse update(String id, MedicalRecordUpdateRequest req, User currentUser, String ipAddress, String userAgent) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));

        if (currentUser != null && currentUser.getRole() == UserRole.LAB_TECHNICIAN) {
            if (!isLabReferral(record)) throw new ForbiddenException("Lab technicians can update only lab referrals.");
            if (req.getDiagnosis() != null || req.getSymptoms() != null || req.getVitalSigns() != null
                    || req.getVisitDate() != null || req.getPatientId() != null || req.getDoctorId() != null) {
                throw new ForbiddenException("Lab technicians can update referral status and results only.");
            }
        }
        if (currentUser != null && currentUser.getRole() == UserRole.DOCTOR) {
            String ownDoctorId = doctorRepository.findByUserId(currentUser.getId()).map(Doctor::getId).orElse("-1");
            if (record.getDoctorId() == null || !ownDoctorId.equals(record.getDoctorId())) {
                throw new ForbiddenException("Doctors can update only their own medical records.");
            }
        }

        if (req.getDiagnosis() != null) record.setDiagnosis(req.getDiagnosis());
        if (req.getSymptoms() != null) record.setSymptoms(req.getSymptoms());
        if (req.getExaminationNotes() != null) record.setExaminationNotes(req.getExaminationNotes());
        if (req.getVitalSigns() != null) record.setVitalSigns(req.getVitalSigns());
        if (req.getAttachments() != null) record.setAttachments(req.getAttachments());
        if (req.getVisitDate() != null) record.setVisitDate(req.getVisitDate());

        record = medicalRecordRepository.save(record);
        auditService.logAction("MEDICAL_RECORD_UPDATED", "MedicalRecord", currentUser, record.getId(),
                Map.of("id", record.getId()), ipAddress, userAgent);
        return toResponse(record);
    }

    private boolean isLabReferral(MedicalRecord record) {
        String diagnosis = record.getDiagnosis();
        boolean referralDiagnosis = diagnosis != null && diagnosis.trim().regionMatches(true, 0, "Lab Referral:", 0, "Lab Referral:".length());
        return referralDiagnosis || (record.getExaminationNotes() != null
                && LAB_REFERRAL_MARKER.matcher(record.getExaminationNotes()).find());
    }

    public MedicalRecordResponse toResponse(MedicalRecord r) {
        MedicalRecordResponse res = new MedicalRecordResponse();
        res.setId(r.getId());
        res.setRecordNumber(r.getRecordNumber());
        res.setPatientId(r.getPatientId());
        res.setPatientName(r.getPatientName());
        res.setPatientCode(r.getPatientCode());
        res.setDoctorId(r.getDoctorId());
        res.setDoctorName(r.getDoctorName());
        res.setDiagnosis(r.getDiagnosis());
        res.setSymptoms(r.getSymptoms());
        res.setExaminationNotes(r.getExaminationNotes());
        res.setVitalSigns(r.getVitalSigns());
        res.setAttachments(r.getAttachments());
        res.setVisitDate(r.getVisitDate());
        res.setCreatedAt(r.getCreatedAt());
        res.setUpdatedAt(r.getUpdatedAt());
        return res;
    }
}
