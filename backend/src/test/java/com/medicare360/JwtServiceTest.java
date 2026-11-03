package com.medicare360;

import com.medicare360.security.JwtService;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", "my-super-secret-jwt-signing-key-for-unit-testing-32-bytes");
        ReflectionTestUtils.setField(jwtService, "accessExpiryMinutes", 60);
        ReflectionTestUtils.setField(jwtService, "refreshExpiryDays", 7);
    }

    @Test
    void testGenerateAndValidateAccessToken() {
        String token = jwtService.generateAccessToken(1L, "ADMIN");
        assertNotNull(token);

        Claims claims = jwtService.validateToken(token);
        assertNotNull(claims);
        assertEquals(1L, jwtService.extractUserId(claims));
        assertEquals("ADMIN", jwtService.extractRole(claims));
        assertEquals("access", jwtService.extractType(claims));
        assertNotNull(jwtService.extractJti(claims));
    }

    @Test
    void testGenerateAndValidateRefreshToken() {
        String token = jwtService.generateRefreshToken(2L, "PATIENT");
        assertNotNull(token);

        Claims claims = jwtService.validateToken(token);
        assertNotNull(claims);
        assertEquals(2L, jwtService.extractUserId(claims));
        assertEquals("PATIENT", jwtService.extractRole(claims));
        assertEquals("refresh", jwtService.extractType(claims));
    }

    @Test
    void testInvalidTokenReturnsNull() {
        Claims claims = jwtService.validateToken("invalid.token.here");
        assertNull(claims);
    }
}

