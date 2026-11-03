package com.medicare360.service;

import com.medicare360.dto.AppointmentCreateRequest;
import com.medicare360.dto.AppointmentResponse;
import com.medicare360.dto.AppointmentStatusUpdateRequest;
import com.medicare360.dto.AppointmentUpdateRequest;
import com.medicare360.entity.*;
import com.medicare360.exception.BadRequestException;
import com.medicare360.exception.ResourceNotFoundException;
import com.medicare360.repository.AppointmentRepository;
import com.medicare360.repository.DepartmentRepository;
import com.medicare360.repository.DoctorRepository;
import com.medicare360.repository.PatientRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            DepartmentRepository departmentRepository,
            AuditService auditService,
            NotificationService notificationService
    ) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.departmentRepository = departmentRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getMulti(int skip, int limit, Long patientId, Long doctorId, String statusStr, String dateStr) {
        int page = limit > 0 ? skip / limit : 0;
        int size = limit > 0 ? limit : 50;
        Pageable pageable = PageRequest.of(page, size, Sort.by("appointmentDate").descending());

        Page<Appointment> appointments = appointmentRepository.findAll(pageable);
        return appointments.getContent().stream()
                .filter(a -> patientId == null || (a.getPatient() != null && a.getPatient().getId().equals(patientId)))
                .filter(a -> doctorId == null || (a.getDoctor() != null && a.getDoctor().getId().equals(doctorId)))
                .filter(a -> statusStr == null || (a.getStatus() != null && a.getStatus().getDbValue().equalsIgnoreCase(statusStr)))
                .filter(a -> dateStr == null || (a.getAppointmentDate() != null && a.getAppointmentDate().equals(dateStr)))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getById(Long id) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        return toResponse(apt);
    }

    @Transactional
    public AppointmentResponse create(AppointmentCreateRequest req, User currentUser, String ipAddress, String userAgent) {
        Patient patient = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Doctor doctor = doctorRepository.findById(req.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        Department dept = null;
        if (req.getDepartmentId() != null) {
            dept = departmentRepository.findById(req.getDepartmentId()).orElse(null);
        } else if (doctor.getDepartment() != null) {
            dept = doctor.getDepartment();
        }

        Appointment apt = new Appointment();
        apt.setAppointmentNumber("APT-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase());
        apt.setPatient(patient);
        apt.setDoctor(doctor);
        apt.setDepartment(dept);
        String dateStr = req.getAppointmentDate();
        String timeStr = req.getAppointmentTime();
        if (dateStr != null && dateStr.contains("T")) {
            String[] parts = dateStr.split("T");
            dateStr = parts[0];
            if (timeStr == null || timeStr.trim().isEmpty()) {
                timeStr = parts[1].length() >= 5 ? parts[1].substring(0, 5) : parts[1];
            }
        }
        if (dateStr == null || dateStr.trim().isEmpty()) {
            dateStr = java.time.LocalDate.now().toString();
        }
        if (timeStr == null || timeStr.trim().isEmpty()) {
            timeStr = "09:00 AM";
        }
        apt.setAppointmentDate(dateStr);
        apt.setAppointmentTime(timeStr);
        apt.setType(req.getType() != null ? req.getType() : "General Consultation");
        apt.setReason(req.getReason());
        apt.setStatus(AppointmentStatus.SCHEDULED);
        apt.setNotes(req.getNotes());

        apt = appointmentRepository.save(apt);

        auditService.logAction(
                "APPOINTMENT_CREATED",
                "Appointment",
                currentUser,
                apt.getId().toString(),
                Map.of(
                        "patient_id", apt.getPatient().getId(),
                        "doctor_id", apt.getDoctor().getId(),
                        "date", String.valueOf(apt.getAppointmentDate()),
                        "time", String.valueOf(apt.getAppointmentTime())
                ),
                ipAddress,
                userAgent
        );

        if (doctor.getUser() != null) {
            notificationService.createNotification(
                    doctor.getUser().getId(),
                    "New Appointment Scheduled",
                    "You have a new appointment with " + patient.getFullName() + " on " + apt.getAppointmentDate() + ".",
                    "appointment",
                    "/doctor/appointments"
            );
        }

        if (patient.getUser() != null) {
            notificationService.createNotification(
                    patient.getUser().getId(),
                    "Appointment Confirmed",
                    "Your appointment is scheduled for " + apt.getAppointmentDate() + " at " + apt.getAppointmentTime() + ".",
                    "appointment",
                    "/patient/appointments"
            );
        }

        return toResponse(apt);
    }

    @Transactional
    public AppointmentResponse update(Long id, AppointmentUpdateRequest req, User currentUser, String ipAddress, String userAgent) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (req.getAppointmentDate() != null) apt.setAppointmentDate(req.getAppointmentDate());
        if (req.getAppointmentTime() != null) apt.setAppointmentTime(req.getAppointmentTime());
        if (req.getType() != null) apt.setType(req.getType());
        if (req.getReason() != null) apt.setReason(req.getReason());
        if (req.getNotes() != null) apt.setNotes(req.getNotes());

        if (req.getStatus() != null && !req.getStatus().isBlank()) {
            apt.setStatus(AppointmentStatus.fromDbValue(req.getStatus()));
        }

        apt = appointmentRepository.save(apt);

        auditService.logAction(
                "APPOINTMENT_UPDATED",
                "Appointment",
                currentUser,
                apt.getId().toString(),
                Map.of("id", apt.getId()),
                ipAddress,
                userAgent
        );

        return toResponse(apt);
    }

    @Transactional
    public AppointmentResponse updateStatus(Long id, AppointmentStatusUpdateRequest req, User currentUser, String ipAddress, String userAgent) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        AppointmentStatus oldStatus = apt.getStatus();
        AppointmentStatus newStatus = AppointmentStatus.fromDbValue(req.getStatus());
        apt.setStatus(newStatus);
        if (req.getNotes() != null) {
            apt.setNotes(req.getNotes());
        }

        apt = appointmentRepository.save(apt);

        auditService.logAction(
                "APPOINTMENT_STATUS_CHANGED",
                "Appointment",
                currentUser,
                apt.getId().toString(),
                Map.of("from", oldStatus != null ? oldStatus.getDbValue() : "", "to", newStatus.getDbValue()),
                ipAddress,
                userAgent
        );

        return toResponse(apt);
    }

    @Transactional
    public void delete(Long id, User currentUser, String ipAddress, String userAgent) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        appointmentRepository.delete(apt);

        auditService.logAction(
                "APPOINTMENT_DELETED",
                "Appointment",
                currentUser,
                id.toString(),
                Map.of("appointment_number", apt.getAppointmentNumber()),
                ipAddress,
                userAgent
        );
    }

    public AppointmentResponse toResponse(Appointment a) {
        AppointmentResponse res = new AppointmentResponse();
        res.setId(a.getId());
        res.setAppointmentNumber(a.getAppointmentNumber());
        if (a.getPatient() != null) {
            res.setPatientId(a.getPatient().getId());
            res.setPatientName(a.getPatient().getFullName());
        }
        if (a.getDoctor() != null) {
            res.setDoctorId(a.getDoctor().getId());
            res.setDoctorName(a.getDoctor().getFullName());
        }
        if (a.getDepartment() != null) {
            res.setDepartmentId(a.getDepartment().getId());
            res.setDepartmentName(a.getDepartment().getName());
        }
        res.setAppointmentDate(a.getAppointmentDate());
        res.setAppointmentTime(a.getAppointmentTime());
        res.setType(a.getType());
        res.setReason(a.getReason());
        res.setStatus(a.getStatus() != null ? a.getStatus().getDbValue() : "Scheduled");
        res.setNotes(a.getNotes());
        res.setCreatedAt(a.getCreatedAt());
        res.setUpdatedAt(a.getUpdatedAt());
        return res;
    }
}

