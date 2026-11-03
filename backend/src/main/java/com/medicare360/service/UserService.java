package com.medicare360.service;

import com.medicare360.common.RoleAssignments;
import com.medicare360.dto.UserCreateRequest;
import com.medicare360.dto.UserResponse;
import com.medicare360.dto.UserUpdateRequest;
import com.medicare360.entity.User;
import com.medicare360.entity.UserRole;
import com.medicare360.exception.BadRequestException;
import com.medicare360.exception.ForbiddenException;
import com.medicare360.exception.ResourceNotFoundException;
import com.medicare360.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final NurseRepository nurseRepository;
    private final ReceptionistRepository receptionistRepository;
    private final PharmacistRepository pharmacistRepository;

    public UserService(UserRepository userRepository, AuthService authService, PasswordEncoder passwordEncoder,
                       AuditService auditService, DoctorRepository doctorRepository, PatientRepository patientRepository,
                       NurseRepository nurseRepository, ReceptionistRepository receptionistRepository,
                       PharmacistRepository pharmacistRepository) {
        this.userRepository = userRepository;
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.nurseRepository = nurseRepository;
        this.receptionistRepository = receptionistRepository;
        this.pharmacistRepository = pharmacistRepository;
    }

    public UserResponse createUser(UserCreateRequest req, User currentUser, String ipAddress, String userAgent) {
        UserRole role = UserRole.PATIENT;
        if (req.getRole() != null && !req.getRole().isBlank()) {
            try {
                role = UserRole.valueOf(req.getRole().toUpperCase());
            } catch (Exception e) {
                throw new BadRequestException("Invalid role specified: " + req.getRole());
            }
        }

        if (role == UserRole.ADMIN) {
            throw new ForbiddenException("Administrator accounts cannot be created from the application.");
        }

        if (role == UserRole.PATIENT) {
            if (req.getDepartment() != null && !req.getDepartment().isBlank()
                    && !req.getDepartment().equalsIgnoreCase("N/A") && !req.getDepartment().equalsIgnoreCase("None")) {
                throw new BadRequestException("Patients cannot be assigned to hospital staff departments.");
            }
        } else {
            if (req.getDepartment() == null || req.getDepartment().isBlank()) {
                throw new BadRequestException("Assigned department/designation is required for " + role.name() + ".");
            }
            if (!RoleAssignments.isValidAssignment(role, req.getDepartment())) {
                throw new BadRequestException("Invalid department/designation '" + req.getDepartment() + "' for role " + role.name()
                        + ". Valid options: " + String.join(", ", RoleAssignments.getAssignmentsForRole(role)));
            }
        }

        User created = authService.registerUser(req.getEmail(), req.getPassword(), req.getFullName(),
                role, req.getPhoneNumber(), req.getDepartment(), ipAddress, userAgent);
        return authService.toUserResponse(created);
    }

    public List<UserResponse> listUsers(int skip, int limit, String roleStr) {
        int page = limit > 0 ? skip / limit : 0;
        int size = limit > 0 ? limit : 100;
        Pageable pageable = PageRequest.of(page, size);

        UserRole role = null;
        if (roleStr != null && !roleStr.isBlank()) {
            try { role = UserRole.valueOf(roleStr.toUpperCase()); } catch (Exception ignored) {}
        }

        Page<User> users = userRepository.findAll(pageable);
        final UserRole filterRole = role;
        return users.getContent().stream()
                .filter(u -> filterRole == null || u.getRole() == filterRole)
                .map(authService::toUserResponse)
                .toList();
    }

    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return authService.toUserResponse(user);
    }

    public UserResponse updateUser(String id, UserUpdateRequest req, User currentUser, String ipAddress, String userAgent) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (req.getFullName() != null) user.setFullName(req.getFullName());
        if (req.getPhone() != null) user.setPhone(req.getPhone());

        if (req.getIsActive() != null) {
            if (user.getId().equals(currentUser.getId()) && !req.getIsActive()) {
                throw new BadRequestException("You cannot deactivate your own account.");
            }
            user.setActive(req.getIsActive());
        }

        UserRole targetRole = user.getRole();
        if (req.getRole() != null && !req.getRole().isBlank()) {
            try {
                UserRole newRole = UserRole.valueOf(req.getRole().toUpperCase());
                if (newRole == UserRole.ADMIN) {
                    throw new ForbiddenException("Administrator role cannot be assigned from the application.");
                }
                user.setRole(newRole);
                targetRole = newRole;
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid role specified.");
            }
        }

        if (req.getDepartment() != null) {
            String dept = req.getDepartment().trim();
            if (targetRole == UserRole.PATIENT) {
                if (!dept.isBlank() && !dept.equalsIgnoreCase("N/A") && !dept.equalsIgnoreCase("None")) {
                    throw new BadRequestException("Patients cannot be assigned to hospital staff departments.");
                }
                user.setDepartment(null);
            } else {
                if (!dept.isBlank() && !RoleAssignments.isValidAssignment(targetRole, dept)) {
                    throw new BadRequestException("Invalid department/designation '" + dept + "' for role " + targetRole.name()
                            + ". Valid options: " + String.join(", ", RoleAssignments.getAssignmentsForRole(targetRole)));
                }
                user.setDepartment(dept.isBlank() ? null : dept);
            }
        }

        if (req.getPassword() != null) {
            if (req.getPassword().length() < 6) throw new BadRequestException("Password must be at least 6 characters long.");
            user.setHashedPassword(passwordEncoder.encode(req.getPassword()));
        }

        user = userRepository.save(user);
        auditService.logAction("USER_UPDATED", "User", currentUser, user.getId(),
                Map.of("updated_user_id", user.getId()), ipAddress, userAgent);
        return authService.toUserResponse(user);
    }

    public void deleteUser(String id, User currentUser, String ipAddress, String userAgent) {
        if (id.equals(currentUser.getId())) {
            throw new BadRequestException("You cannot delete your own active administrator account.");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        doctorRepository.findByUserId(id).ifPresent(doctorRepository::delete);
        patientRepository.findByUserId(id).ifPresent(patientRepository::delete);
        nurseRepository.findByUserId(id).ifPresent(nurseRepository::delete);
        receptionistRepository.findByUserId(id).ifPresent(receptionistRepository::delete);
        pharmacistRepository.findByUserId(id).ifPresent(pharmacistRepository::delete);

        userRepository.delete(user);
        auditService.logAction("USER_DELETED", "User", currentUser, id,
                Map.of("deleted_user_email", user.getEmail()), ipAddress, userAgent);
    }
}
