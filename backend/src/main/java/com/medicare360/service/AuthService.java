package com.medicare360.service;

import com.medicare360.dto.LoginRequest;
import com.medicare360.dto.RegisterRequest;
import com.medicare360.dto.TokenResponse;
import com.medicare360.dto.UserResponse;
import com.medicare360.entity.*;
import com.medicare360.exception.BadRequestException;
import com.medicare360.repository.*;
import com.medicare360.security.JwtService;
import com.medicare360.security.TokenBlacklistService;
import io.jsonwebtoken.Claims;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final NurseRepository nurseRepository;
    private final ReceptionistRepository receptionistRepository;
    private final PharmacistRepository pharmacistRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;
    private final AuditService auditService;

    public AuthService(
            UserRepository userRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            DepartmentRepository departmentRepository,
            NurseRepository nurseRepository,
            ReceptionistRepository receptionistRepository,
            PharmacistRepository pharmacistRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            TokenBlacklistService tokenBlacklistService,
            AuditService auditService
    ) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.departmentRepository = departmentRepository;
        this.nurseRepository = nurseRepository;
        this.receptionistRepository = receptionistRepository;
        this.pharmacistRepository = pharmacistRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.auditService = auditService;
    }

    public boolean checkAdminExists() {
        return userRepository.findAll().stream()
                .anyMatch(u -> u.getRole() == UserRole.ADMIN && u.isActive());
    }

    public User registerUser(String email, String password, String fullName, UserRole role,
                             String phone, String departmentName, String ipAddress, String userAgent) {
        String cleanEmail = email.trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new BadRequestException("A user account with this email address already exists.");
        }
        if (password == null || password.length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters long.");
        }

        User user = new User();
        user.setEmail(cleanEmail);
        user.setHashedPassword(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setRole(role != null ? role : UserRole.PATIENT);
        user.setPhone(phone);
        user.setDepartment(role == UserRole.PATIENT ? null : departmentName);
        user.setActive(true);
        user.setVerified(true);
        user = userRepository.save(user);

        if (user.getRole() == UserRole.PATIENT) {
            Patient patient = new Patient();
            patient.setPatientId("PAT-" + (100000 + new Random().nextInt(900000)));
            patient.setUserId(user.getId());
            patient.setFullName(user.getFullName());
            patient.setGender("Other");
            patient.setDateOfBirth("2000-01-01");
            patient.setPhone(user.getPhone() != null ? user.getPhone() : "0000000000");
            patient.setEmail(user.getEmail());
            patient.setStatus("Active");
            patientRepository.save(patient);
        } else if (user.getRole() == UserRole.DOCTOR) {
            // Find department by name
            Department dept = null;
            if (departmentName != null && !departmentName.isBlank()) {
                dept = departmentRepository.findAll().stream()
                        .filter(d -> d.getName().toLowerCase().contains(departmentName.toLowerCase()))
                        .findFirst().orElse(null);
            }
            if (dept == null) {
                dept = departmentRepository.findAll().stream().findFirst().orElse(null);
            }

            Doctor doctor = new Doctor();
            doctor.setDoctorId("DOC-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase());
            doctor.setUserId(user.getId());
            doctor.setFullName(user.getFullName());
            if (dept != null) {
                doctor.setDepartmentId(dept.getId());
                doctor.setDepartmentName(dept.getName());
            }
            doctor.setSpecialization(dept != null ? dept.getName() : "General Medicine");
            doctor.setQualification("MD, MBBS");
            doctor.setExperienceYears(5);
            doctor.setConsultationFee(120.0);
            doctor.setPhone(user.getPhone() != null ? user.getPhone() : "0000000000");
            doctor.setEmail(user.getEmail());
            doctor.setStatus("Available");
            doctorRepository.save(doctor);
        } else if (user.getRole() == UserRole.NURSE) {
            Nurse nurse = new Nurse();
            nurse.setNurseId("NUR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase());
            nurse.setUserId(user.getId());
            nurse.setFullName(user.getFullName());
            nurse.setLicenseNumber("RN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase());
            nurse.setShift("Morning");
            nurse.setPhone(user.getPhone() != null ? user.getPhone() : "0000000000");
            nurse.setEmail(user.getEmail());
            nurse.setStatus("Active");
            nurseRepository.save(nurse);
        } else if (user.getRole() == UserRole.RECEPTIONIST) {
            Receptionist rec = new Receptionist();
            rec.setReceptionistId("REC-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase());
            rec.setUserId(user.getId());
            rec.setFullName(user.getFullName());
            rec.setShift("Day");
            rec.setPhone(user.getPhone() != null ? user.getPhone() : "0000000000");
            rec.setEmail(user.getEmail());
            rec.setStatus("Active");
            receptionistRepository.save(rec);
        } else if (user.getRole() == UserRole.PHARMACIST) {
            Pharmacist pharm = new Pharmacist();
            pharm.setPharmacistId("PHAR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase());
            pharm.setUserId(user.getId());
            pharm.setFullName(user.getFullName());
            pharm.setLicenseNumber("RPH-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase());
            pharm.setPhone(user.getPhone() != null ? user.getPhone() : "0000000000");
            pharm.setEmail(user.getEmail());
            pharm.setStatus("Active");
            pharmacistRepository.save(pharm);
        }

        auditService.logAction(
                "USER_REGISTERED", "User", user, user.getId(),
                Map.of("email", user.getEmail(), "role", user.getRole().name()),
                ipAddress, userAgent);
        return user;
    }

    public TokenResponse setupAdmin(String email, String password, String fullName, String phone,
                                    String ipAddress, String userAgent) {
        if (checkAdminExists()) {
            throw new BadRequestException("System administrator account is already configured.");
        }
        User admin = registerUser(email, password, fullName, UserRole.ADMIN, phone, null, ipAddress, userAgent);
        String access = jwtService.generateAccessToken(admin.getId(), admin.getRole().name());
        String refresh = jwtService.generateRefreshToken(admin.getId(), admin.getRole().name());
        return new TokenResponse(access, refresh, toUserResponse(admin));
    }

    public UserResponse registerPatient(RegisterRequest req, String ipAddress, String userAgent) {
        User user = registerUser(req.getEmail(), req.getPassword(), req.getFullName(),
                UserRole.PATIENT, req.getPhoneNumber(), null, ipAddress, userAgent);
        return toUserResponse(user);
    }

    public TokenResponse authenticate(LoginRequest loginData, String ipAddress, String userAgent) {
        String cleanEmail = loginData.getEmail() != null ? loginData.getEmail().trim().toLowerCase() : "";
        User user = userRepository.findByEmailIgnoreCase(cleanEmail).orElse(null);

        if (loginData.getRole() != null && !loginData.getRole().isBlank()) {
            String expectedRole = loginData.getRole().trim().toUpperCase();
            if (user == null || !user.getRole().name().equalsIgnoreCase(expectedRole)) {
                throw new BadRequestException("Invalid credentials or unauthorized role");
            }
        }

        boolean passwordMatches = user != null
                && user.getHashedPassword() != null
                && passwordEncoder.matches(loginData.getPassword(), user.getHashedPassword());

        if (user == null || !passwordMatches) {
            throw new BadRequestException("Invalid credentials or unauthorized role");
        }
        if (!user.isActive()) {
            throw new BadRequestException("Account is deactivated. Please contact Hospital Administration.");
        }

        user.setLastLogin(Instant.now());
        user = userRepository.save(user);

        String access = jwtService.generateAccessToken(user.getId(), user.getRole().name());
        String refresh = jwtService.generateRefreshToken(user.getId(), user.getRole().name());

        auditService.logAction("USER_LOGIN", "User", user, user.getId(),
                Map.of("email", user.getEmail(), "role", user.getRole().name()), ipAddress, userAgent);

        return new TokenResponse(access, refresh, toUserResponse(user));
    }

    public TokenResponse refreshToken(String refreshToken) {
        Claims claims = jwtService.validateToken(refreshToken);
        if (claims == null || !"refresh".equals(jwtService.extractType(claims))) {
            throw new BadRequestException("Invalid or expired refresh token");
        }

        String jti = jwtService.extractJti(claims);
        if (jti != null && tokenBlacklistService.isBlacklisted(jti)) {
            throw new BadRequestException("Invalid or expired refresh token");
        }

        String userId = jwtService.extractUserId(claims);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found or inactive"));
        if (!user.isActive()) {
            throw new BadRequestException("User not found or inactive");
        }

        if (jti != null) tokenBlacklistService.blacklist(jti);

        String newAccess = jwtService.generateAccessToken(user.getId(), user.getRole().name());
        String newRefresh = jwtService.generateRefreshToken(user.getId(), user.getRole().name());
        return new TokenResponse(newAccess, newRefresh, toUserResponse(user));
    }

    public void logout(String authHeader, User user, String ipAddress, String userAgent) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            Claims claims = jwtService.validateToken(token);
            if (claims != null) {
                String jti = jwtService.extractJti(claims);
                if (jti != null) tokenBlacklistService.blacklist(jti);
            }
        }
        auditService.logAction("USER_LOGOUT", "User", user,
                user != null ? user.getId() : "unknown",
                user != null ? Map.of("email", user.getEmail()) : Map.of(),
                ipAddress, userAgent);
    }

    public UserResponse toUserResponse(User user) {
        UserResponse res = new UserResponse();
        res.setId(user.getId());
        res.setEmail(user.getEmail());
        res.setFullName(user.getFullName());
        res.setRole(user.getRole() != null ? user.getRole().name() : "PATIENT");
        res.setPhone(user.getPhone());
        res.setActive(user.isActive());
        res.setVerified(user.isVerified());
        res.setLastLogin(user.getLastLogin());
        res.setCreatedAt(user.getCreatedAt());
        res.setUpdatedAt(user.getUpdatedAt());
        res.setDepartment(user.getDepartment());

        if (user.getRole() == UserRole.PATIENT) {
            patientRepository.findByUserId(user.getId())
                    .ifPresent(p -> res.setProfileId(p.getPatientId()));
        } else if (user.getRole() == UserRole.DOCTOR) {
            doctorRepository.findByUserId(user.getId())
                    .ifPresent(d -> {
                        res.setProfileId(d.getDoctorId());
                        if (res.getDepartment() == null && d.getDepartmentName() != null) {
                            res.setDepartment(d.getDepartmentName());
                        }
                    });
        } else if (user.getRole() == UserRole.NURSE) {
            nurseRepository.findByUserId(user.getId())
                    .ifPresent(n -> res.setProfileId(n.getNurseId()));
        } else if (user.getRole() == UserRole.RECEPTIONIST) {
            receptionistRepository.findByUserId(user.getId())
                    .ifPresent(r -> res.setProfileId(r.getReceptionistId()));
        } else if (user.getRole() == UserRole.PHARMACIST) {
            pharmacistRepository.findByUserId(user.getId())
                    .ifPresent(ph -> res.setProfileId(ph.getPharmacistId()));
        }

        return res;
    }
}
