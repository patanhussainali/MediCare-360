package com.medicare360.service;

import com.medicare360.common.PhoneNumberValidator;
import com.medicare360.dto.DoctorCreateRequest;
import com.medicare360.dto.DoctorResponse;
import com.medicare360.dto.DoctorUpdateRequest;
import com.medicare360.entity.Department;
import com.medicare360.entity.Doctor;
import com.medicare360.entity.User;
import com.medicare360.entity.UserRole;
import com.medicare360.exception.BadRequestException;
import com.medicare360.exception.ResourceNotFoundException;
import com.medicare360.repository.DepartmentRepository;
import com.medicare360.repository.DoctorRepository;
import com.medicare360.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final UserCodeGenerator userCodeGenerator;
    private final DepartmentService departmentService;

    public DoctorService(DoctorRepository doctorRepository, DepartmentRepository departmentRepository,
                         UserRepository userRepository, PasswordEncoder passwordEncoder, AuditService auditService,
                         UserCodeGenerator userCodeGenerator, DepartmentService departmentService) {
        this.doctorRepository = doctorRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
        this.userCodeGenerator = userCodeGenerator;
        this.departmentService = departmentService;
    }

    public List<DoctorResponse> getMulti(int skip, int limit, String departmentId, Boolean isAvailable) {
        int page = limit > 0 ? skip / limit : 0;
        int size = limit > 0 ? limit : 100;
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());

        Page<Doctor> doctors = doctorRepository.findAll(pageable);
        return doctors.getContent().stream()
                .filter(d -> departmentId == null || departmentId.equals(d.getDepartmentId()))
                .filter(d -> isAvailable == null || (isAvailable ? "Available".equalsIgnoreCase(d.getStatus()) : !"Available".equalsIgnoreCase(d.getStatus())))
                .map(this::toResponse)
                .toList();
    }

    public DoctorResponse getById(String id) {
        Doctor doc = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        return toResponse(doc);
    }

    public DoctorResponse getByUserId(String userId) {
        Doctor doc = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user"));
        return toResponse(doc);
    }

    public DoctorResponse create(DoctorCreateRequest req, User currentUser, String ipAddress, String userAgent) {
        PhoneNumberValidator.validateIfPresent(req.getPhone());
        String cleanEmail = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new BadRequestException("Email '" + cleanEmail + "' is already registered in the system.");
        }

        Department dept = null;
        if (req.getDepartmentId() != null && !req.getDepartmentId().isBlank()) {
            dept = departmentRepository.findById(req.getDepartmentId()).orElse(null);
        }
        if (dept == null) {
            String requestedDepartment = req.getDepartment() != null ? req.getDepartment() : req.getSpecialization();
            dept = departmentService.findOrCreateByName(requestedDepartment);
        }

        String password = req.getPassword() != null && !req.getPassword().isBlank()
                ? req.getPassword() : UUID.randomUUID().toString().substring(0, 12);

        User user = new User();
        user.setUserCode(userCodeGenerator.nextCode());
        user.setEmail(cleanEmail);
        user.setHashedPassword(passwordEncoder.encode(password));
        user.setFullName(req.getFullName());
        user.setRole(UserRole.DOCTOR);
        user.setPhone(req.getPhone());
        user.setDepartment(dept != null ? dept.getName() : req.getDepartment());
        user.setActive(true);
        user.setVerified(true);
        user = userRepository.save(user);

        Doctor doc = new Doctor();
        doc.setDoctorId("DOC-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase());
        doc.setUserId(user.getId());
        doc.setFullName(req.getFullName());
        if (dept != null) {
            doc.setDepartmentId(dept.getId());
            doc.setDepartmentName(dept.getName());
        }
        doc.setSpecialization(req.getSpecialization());
        doc.setQualification(req.getQualification());
        doc.setExperienceYears(req.getExperienceYears() != null ? req.getExperienceYears() : 0);
        doc.setConsultationFee(req.getConsultationFee() != null ? req.getConsultationFee() : 0.0);
        doc.setAvailableDays(req.getAvailableDays());
        doc.setPhone(req.getPhone());
        doc.setEmail(cleanEmail);
        doc.setStatus(req.getStatus() != null ? req.getStatus() : "Available");
        doc = doctorRepository.save(doc);

        auditService.logAction("DOCTOR_CREATED", "Doctor",
                currentUser != null ? currentUser : user, doc.getId(),
                Map.of("email", doc.getEmail(), "specialization", String.valueOf(doc.getSpecialization())),
                ipAddress, userAgent);

        return toResponse(doc);
    }

    public DoctorResponse update(String id, DoctorUpdateRequest req, User currentUser, String ipAddress, String userAgent) {
        PhoneNumberValidator.validateIfPresent(req.getPhone());
        Doctor doc = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (req.getFullName() != null) doc.setFullName(req.getFullName());
        if (req.getSpecialization() != null) doc.setSpecialization(req.getSpecialization());
        if (req.getQualification() != null) doc.setQualification(req.getQualification());
        if (req.getExperienceYears() != null) doc.setExperienceYears(req.getExperienceYears());
        if (req.getConsultationFee() != null) doc.setConsultationFee(req.getConsultationFee());
        if (req.getAvailableDays() != null) doc.setAvailableDays(req.getAvailableDays());
        if (req.getPhone() != null) doc.setPhone(req.getPhone());
        if (req.getStatus() != null) doc.setStatus(req.getStatus());

        if (req.getDepartmentId() != null && !req.getDepartmentId().isBlank()) {
            departmentRepository.findById(req.getDepartmentId()).ifPresent(dept -> {
                doc.setDepartmentId(dept.getId());
                doc.setDepartmentName(dept.getName());
            });
        }

        doctorRepository.save(doc);
        auditService.logAction("DOCTOR_UPDATED", "Doctor", currentUser, doc.getId(),
                Map.of("id", doc.getId()), ipAddress, userAgent);
        return toResponse(doc);
    }

    public DoctorResponse toResponse(Doctor doc) {
        DoctorResponse res = new DoctorResponse();
        res.setId(doc.getId());
        res.setDoctorId(doc.getDoctorId());
        res.setUserId(doc.getUserId());
        if (doc.getUserId() != null) {
            userRepository.findById(doc.getUserId()).ifPresent(user -> res.setUserCode(user.getUserCode()));
        }
        res.setFullName(doc.getFullName());
        res.setSpecialization(doc.getSpecialization());
        res.setQualification(doc.getQualification());
        res.setExperienceYears(doc.getExperienceYears());
        res.setConsultationFee(doc.getConsultationFee());
        res.setAvailableDays(doc.getAvailableDays());
        res.setPhone(doc.getPhone());
        res.setEmail(doc.getEmail());
        res.setStatus(doc.getStatus());
        res.setDepartmentId(doc.getDepartmentId());
        res.setDepartmentName(doc.getDepartmentName());
        res.setCreatedAt(doc.getCreatedAt());
        res.setUpdatedAt(doc.getUpdatedAt());
        return res;
    }
}
