package com.medicare360.service;

import com.medicare360.dto.PatientCreateRequest;
import com.medicare360.dto.PatientResponse;
import com.medicare360.dto.PatientUpdateRequest;
import com.medicare360.entity.Patient;
import com.medicare360.entity.User;
import com.medicare360.entity.UserRole;
import com.medicare360.exception.BadRequestException;
import com.medicare360.exception.ResourceNotFoundException;
import com.medicare360.repository.PatientRepository;
import com.medicare360.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public PatientService(
            PatientRepository patientRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuditService auditService
    ) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    public static String generateMrn() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randNum = 1000 + new Random().nextInt(9000);
        return "MRN-" + dateStr + "-" + randNum;
    }

    @Transactional(readOnly = true)
    public List<PatientResponse> getMulti(int skip, int limit, String search) {
        int page = limit > 0 ? skip / limit : 0;
        int size = limit > 0 ? limit : 50;
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Patient> patients;
        if (search != null && !search.isBlank()) {
            patients = patientRepository.searchPatients(search.trim(), pageable);
        } else {
            patients = patientRepository.findAll(pageable);
        }
        return patients.getContent().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PatientResponse getById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        return toResponse(patient);
    }

    @Transactional
    public PatientResponse getByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User account not found"));
        if (user.getRole() != UserRole.PATIENT) {
            throw new ResourceNotFoundException("Patient profile not found for user");
        }

        Patient patient = patientRepository.findByUserId(userId).orElse(null);
        if (patient == null && user.getEmail() != null && !user.getEmail().isBlank()) {
            Patient matchingPatient = patientRepository.findByEmailIgnoreCase(user.getEmail()).orElse(null);
            if (matchingPatient != null && matchingPatient.getUser() == null) {
                matchingPatient.setUser(user);
                patient = patientRepository.save(matchingPatient);
            }
        }
        if (patient == null) {
            throw new ResourceNotFoundException("Patient profile not found for this account. Please contact the hospital to link your profile.");
        }
        return toResponse(patient);
    }

    @Transactional
    public PatientResponse create(PatientCreateRequest req, User currentUser, String ipAddress, String userAgent) {
        String mrn = req.getMedicalRecordNumber();
        if (mrn == null || mrn.isBlank()) {
            mrn = generateMrn();
            while (patientRepository.findByPatientId(mrn).isPresent()) {
                mrn = generateMrn();
            }
        } else {
            if (patientRepository.findByPatientId(mrn).isPresent()) {
                throw new BadRequestException("Patient with MRN " + mrn + " already exists.");
            }
        }

        String cleanEmail = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new BadRequestException("Email '" + cleanEmail + "' is already registered in the system.");
        }

        String password = req.getPassword() != null && !req.getPassword().isBlank()
                ? req.getPassword()
                : UUID.randomUUID().toString().substring(0, 12);

        User user = new User();
        user.setEmail(cleanEmail);
        user.setHashedPassword(passwordEncoder.encode(password));
        user.setFullName(req.getFullName());
        user.setRole(UserRole.PATIENT);
        user.setPhone(req.getPhone());
        user.setActive(true);
        user.setVerified(true);
        user = userRepository.save(user);

        Patient patient = new Patient();
        patient.setPatientId(mrn);
        patient.setUser(user);
        patient.setFullName(req.getFullName());
        patient.setGender(req.getGender());
        patient.setDateOfBirth(req.getDateOfBirth());
        patient.setPhone(req.getPhone());
        patient.setEmail(cleanEmail);
        patient.setBloodGroup(req.getBloodGroup());
        patient.setAddress(req.getAddress());
        patient.setEmergencyContact(req.getEmergencyContact());
        patient.setAllergies(req.getAllergies());
        patient.setChronicConditions(req.getChronicConditions());
        patient.setStatus(req.getStatus() != null ? req.getStatus() : "Active");

        patient = patientRepository.save(patient);

        auditService.logAction(
                "PATIENT_CREATED",
                "Patient",
                currentUser != null ? currentUser : user,
                patient.getId().toString(),
                Map.of("mrn", patient.getPatientId(), "name", patient.getFullName()),
                ipAddress,
                userAgent
        );

        return toResponse(patient);
    }

    @Transactional
    public PatientResponse update(Long id, PatientUpdateRequest req, User currentUser, String ipAddress, String userAgent) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        if (req.getFullName() != null) patient.setFullName(req.getFullName());
        if (req.getPhone() != null) patient.setPhone(req.getPhone());
        if (req.getAddress() != null) patient.setAddress(req.getAddress());
        if (req.getEmergencyContact() != null) patient.setEmergencyContact(req.getEmergencyContact());
        if (req.getAllergies() != null) patient.setAllergies(req.getAllergies());
        if (req.getChronicConditions() != null) patient.setChronicConditions(req.getChronicConditions());
        if (req.getBloodGroup() != null) patient.setBloodGroup(req.getBloodGroup());
        if (req.getStatus() != null) patient.setStatus(req.getStatus());

        patient = patientRepository.save(patient);

        auditService.logAction(
                "PATIENT_UPDATED",
                "Patient",
                currentUser,
                patient.getId().toString(),
                Map.of("id", patient.getId()),
                ipAddress,
                userAgent
        );

        return toResponse(patient);
    }

    @Transactional
    public void delete(Long id, User currentUser, String ipAddress, String userAgent) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        patientRepository.delete(patient);

        auditService.logAction(
                "PATIENT_DELETED",
                "Patient",
                currentUser,
                id.toString(),
                Map.of("mrn", patient.getPatientId()),
                ipAddress,
                userAgent
        );
    }

    public PatientResponse toResponse(Patient p) {
        PatientResponse res = new PatientResponse();
        res.setId(p.getId());
        res.setPatientId(p.getPatientId());
        if (p.getUser() != null) {
            res.setUserId(p.getUser().getId());
        }
        res.setFullName(p.getFullName());
        res.setGender(p.getGender());
        res.setDateOfBirth(p.getDateOfBirth());
        res.setBloodGroup(p.getBloodGroup());
        res.setPhone(p.getPhone());
        res.setEmail(p.getEmail());
        res.setAddress(p.getAddress());
        res.setEmergencyContact(p.getEmergencyContact());
        res.setAllergies(p.getAllergies());
        res.setChronicConditions(p.getChronicConditions());
        res.setStatus(p.getStatus());
        res.setCreatedAt(p.getCreatedAt());
        res.setUpdatedAt(p.getUpdatedAt());
        return res;
    }
}

