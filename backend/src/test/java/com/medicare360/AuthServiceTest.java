package com.medicare360;

import com.medicare360.dto.LoginRequest;
import com.medicare360.dto.RegisterRequest;
import com.medicare360.dto.TokenResponse;
import com.medicare360.dto.UserResponse;
import com.medicare360.entity.User;
import com.medicare360.entity.UserRole;
import com.medicare360.exception.BadRequestException;
import com.medicare360.repository.*;
import com.medicare360.security.JwtService;
import com.medicare360.security.TokenBlacklistService;
import com.medicare360.service.AuditService;
import com.medicare360.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PatientRepository patientRepository;
    @Mock private DoctorRepository doctorRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private NurseRepository nurseRepository;
    @Mock private ReceptionistRepository receptionistRepository;
    @Mock private PharmacistRepository pharmacistRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private TokenBlacklistService tokenBlacklistService;
    @Mock private AuditService auditService;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(10L);
        sampleUser.setEmail("doctor@example.com");
        sampleUser.setFullName("Dr. Gregory House");
        sampleUser.setRole(UserRole.DOCTOR);
        sampleUser.setHashedPassword("hashedPassword123");
        sampleUser.setActive(true);
        sampleUser.setVerified(true);
    }

    @Test
    void testCheckAdminExists_True() {
        User admin = new User();
        admin.setRole(UserRole.ADMIN);
        admin.setActive(true);
        when(userRepository.findAll()).thenReturn(List.of(admin));

        assertTrue(authService.checkAdminExists());
    }

    @Test
    void testCheckAdminExists_False() {
        when(userRepository.findAll()).thenReturn(List.of(sampleUser));
        assertFalse(authService.checkAdminExists());
    }

    @Test
    void testAuthenticate_Success() {
        when(userRepository.findByEmailIgnoreCase("doctor@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("secret123", "hashedPassword123")).thenReturn(true);
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtService.generateAccessToken(10L, "DOCTOR")).thenReturn("mock-access-token");
        when(jwtService.generateRefreshToken(10L, "DOCTOR")).thenReturn("mock-refresh-token");

        LoginRequest req = new LoginRequest();
        req.setEmail("doctor@example.com");
        req.setPassword("secret123");
        req.setRole("DOCTOR");

        TokenResponse res = authService.authenticate(req, "127.0.0.1", "Mozilla");
        assertNotNull(res);
        assertEquals("mock-access-token", res.getAccessToken());
        assertEquals("mock-refresh-token", res.getRefreshToken());
    }

    @Test
    void testAuthenticate_CrossRoleRejection() {
        when(userRepository.findByEmailIgnoreCase("doctor@example.com")).thenReturn(Optional.of(sampleUser));

        LoginRequest req = new LoginRequest();
        req.setEmail("doctor@example.com");
        req.setPassword("secret123");
        req.setRole("ADMIN"); // User is DOCTOR, portal is ADMIN

        assertThrows(BadRequestException.class, () -> authService.authenticate(req, "127.0.0.1", "Mozilla"));
    }

    @Test
    void testAuthenticate_WrongPassword() {
        when(userRepository.findByEmailIgnoreCase("doctor@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongPassword", "hashedPassword123")).thenReturn(false);

        LoginRequest req = new LoginRequest();
        req.setEmail("doctor@example.com");
        req.setPassword("wrongPassword");

        assertThrows(BadRequestException.class, () -> authService.authenticate(req, "127.0.0.1", "Mozilla"));
    }

    @Test
    void testAuthenticate_DeactivatedAccount() {
        sampleUser.setActive(false);
        when(userRepository.findByEmailIgnoreCase("doctor@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("secret123", "hashedPassword123")).thenReturn(true);

        LoginRequest req = new LoginRequest();
        req.setEmail("doctor@example.com");
        req.setPassword("secret123");

        assertThrows(BadRequestException.class, () -> authService.authenticate(req, "127.0.0.1", "Mozilla"));
    }

    @Test
    void testRegisterPatient_DuplicateEmail() {
        when(userRepository.existsByEmailIgnoreCase("patient@example.com")).thenReturn(true);

        RegisterRequest req = new RegisterRequest();
        req.setEmail("patient@example.com");
        req.setPassword("password123");
        req.setFullName("John Doe");

        assertThrows(BadRequestException.class, () -> authService.registerPatient(req, "127.0.0.1", "Mozilla"));
    }
}

