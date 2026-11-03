package com.medicare360.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-expiry-minutes}")
    private int accessExpiryMinutes;

    @Value("${jwt.refresh-expiry-days}")
    private int refreshExpiryDays;

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(String userId, String role) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds((long) accessExpiryMinutes * 60);
        String jti = UUID.randomUUID().toString().replace("-", "");

        return Jwts.builder()
                .subject(userId)
                .claim("role", role)
                .claim("type", "access")
                .id(jti)
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(getKey(), Jwts.SIG.HS256)
                .compact();
    }

    public String generateRefreshToken(String userId, String role) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds((long) refreshExpiryDays * 24L * 60 * 60);
        String jti = UUID.randomUUID().toString().replace("-", "");

        return Jwts.builder()
                .subject(userId)
                .claim("role", role)
                .claim("type", "refresh")
                .id(jti)
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(getKey(), Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Parse and validate a JWT. Returns the Claims payload on success, or null on any error.
     */
    public Claims validateToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            return null;
        }
    }

    public String extractUserId(Claims claims) {
        return claims.getSubject();
    }

    public String extractRole(Claims claims) {
        return claims.get("role", String.class);
    }

    public String extractType(Claims claims) {
        return claims.get("type", String.class);
    }

    public String extractJti(Claims claims) {
        String jti = claims.getId();
        if (jti == null) {
            jti = claims.get("jti", String.class);
        }
        return jti;
    }
}
