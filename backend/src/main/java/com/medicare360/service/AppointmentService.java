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

    public AppointmentService(AppointmentRepository appointmentRepository, PatientRepository patientRepository,
                               DoctorRepository doctorRepository, DepartmentRepository departmentRepository,
                               AuditService auditService, NotificationService notificationService) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.departmentRepository = departmentRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    public List<AppointmentResponse> getMulti(int skip, int limit, String patientId, String doctorId, String statusStr, String dateStr) {
        int page = limit > 0 ? skip / limit : 0;
        int size = limit > 0 ? limit : 50;
        Pageable pageable = PageRequest.of(page, size, Sort.by("appointmentDate").descending());

        Page<Appointment> appointments = appointmentRepository.findAll(pageable);
        return appointments.getContent().stream()
                .filter(a -> patientId == null || patientId.equals(a.getPatientId()))
                .filter(a -> doctorId == null || doctorId.equals(a.getDoctorId()))
                .filter(a -> statusStr == null || (a.getStatus() != null && a.getStatus().getDbValue().equalsIgnoreCase(statusStr)))
                .filter(a -> dateStr == null || dateStr.equals(a.getAppointmentDate()))
                .map(this::toResponse)
                .toList();
    }

    public AppointmentResponse getById(String id) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        return toResponse(apt);
    }

    public AppointmentResponse create(AppointmentCreateRequest req, User currentUser, String ipAddress, String userAgent) {
        Patient patient = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        Doctor doctor = doctorRepository.findById(req.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        Department dept = null;
        if (req.getDepartmentId() != null && !req.getDepartmentId().isBlank()) {
            dept = departmentRepository.findById(req.getDepartmentId()).orElse(null);
        } else if (doctor.getDepartmentId() != null) {
            dept = departmentRepository.findById(doctor.getDepartmentId()).orElse(null);
        }

        Appointment apt = new Appointment();
        apt.setAppointmentNumber("APT-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase());
        apt.setPatientId(patient.getId());
        apt.setPatientName(patient.getFullName());
        apt.setDoctorId(doctor.getId());
        apt.setDoctorName(doctor.getFullName());
        if (dept != null) {
            apt.setDepartmentId(dept.getId());
            apt.setDepartmentName(dept.getName());
        }

        String dateStr = req.getAppointmentDate();
        String timeStr = req.getAppointmentTime();
        if (dateStr != null && dateStr.contains("T")) {
            String[] parts = dateStr.split("T");
            dateStr = parts[0];
            if (timeStr == null || timeStr.trim().isEmpty()) {
                timeStr = parts[1].length() >= 5 ? parts[1].substring(0, 5) : parts[1];
            }
        }
        apt.setAppointmentDate(dateStr != null && !dateStr.isBlank() ? dateStr : java.time.LocalDate.now().toString());
        apt.setAppointmentTime(timeStr != null && !timeStr.isBlank() ? timeStr : "09:00 AM");
        apt.setType(req.getType() != null ? req.getType() : "General Consultation");
        apt.setReason(req.getReason());
        apt.setStatus(AppointmentStatus.SCHEDULED);
        apt.setNotes(req.getNotes());
        apt = appointmentRepository.save(apt);

        auditService.logAction("APPOINTMENT_CREATED", "Appointment", currentUser, apt.getId(),
                Map.of("patient_id", apt.getPatientId(), "doctor_id", apt.getDoctorId(),
                        "date", String.valueOf(apt.getAppointmentDate())),
                ipAddress, userAgent);

        if (doctor.getUserId() != null) {
            notificationService.createNotification(doctor.getUserId(),
                    "New Appointment Scheduled",
                    "You have a new appointment with " + patient.getFullName() + " on " + apt.getAppointmentDate() + ".",
                    "appointment", "/doctor/appointments");
        }
        if (patient.getUserId() != null) {
            notificationService.createNotification(patient.getUserId(),
                    "Appointment Confirmed",
                    "Your appointment is scheduled for " + apt.getAppointmentDate() + " at " + apt.getAppointmentTime() + ".",
                    "appointment", "/patient/appointments");
        }

        return toResponse(apt);
    }

    public AppointmentResponse update(String id, AppointmentUpdateRequest req, User currentUser, String ipAddress, String userAgent) {
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

        auditService.logAction("APPOINTMENT_UPDATED", "Appointment", currentUser, apt.getId(),
                Map.of("id", apt.getId()), ipAddress, userAgent);
        return toResponse(apt);
    }

    public AppointmentResponse updateStatus(String id, AppointmentStatusUpdateRequest req, User currentUser, String ipAddress, String userAgent) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        AppointmentStatus oldStatus = apt.getStatus();
        AppointmentStatus newStatus = AppointmentStatus.fromDbValue(req.getStatus());
        apt.setStatus(newStatus);
        if (req.getNotes() != null) apt.setNotes(req.getNotes());
        apt = appointmentRepository.save(apt);

        auditService.logAction("APPOINTMENT_STATUS_CHANGED", "Appointment", currentUser, apt.getId(),
                Map.of("from", oldStatus != null ? oldStatus.getDbValue() : "", "to", newStatus.getDbValue()),
                ipAddress, userAgent);
        return toResponse(apt);
    }

    public void delete(String id, User currentUser, String ipAddress, String userAgent) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        appointmentRepository.delete(apt);
        auditService.logAction("APPOINTMENT_DELETED", "Appointment", currentUser, id,
                Map.of("appointment_number", apt.getAppointmentNumber()), ipAddress, userAgent);
    }

    public AppointmentResponse toResponse(Appointment a) {
        AppointmentResponse res = new AppointmentResponse();
        res.setId(a.getId());
        res.setAppointmentNumber(a.getAppointmentNumber());
        res.setPatientId(a.getPatientId());
        res.setPatientName(a.getPatientName());
        res.setDoctorId(a.getDoctorId());
        res.setDoctorName(a.getDoctorName());
        res.setDepartmentId(a.getDepartmentId());
        res.setDepartmentName(a.getDepartmentName());
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
