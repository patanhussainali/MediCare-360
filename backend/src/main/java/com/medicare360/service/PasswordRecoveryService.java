package com.medicare360.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicare360.dto.ResetPasswordRequest;
import com.medicare360.entity.PasswordResetToken;
import com.medicare360.entity.User;
import com.medicare360.exception.BadRequestException;
import com.medicare360.repository.PasswordResetTokenRepository;
import com.medicare360.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Map;

@Service
public class PasswordRecoveryService {
    private static final Duration TOKEN_LIFETIME = Duration.ofMinutes(30);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final SecureRandom secureRandom = new SecureRandom();
    private final String resendApiKey;
    private final String mailFrom;
    private final String frontendUrl;

    public PasswordRecoveryService(UserRepository userRepository,
                                   PasswordResetTokenRepository tokenRepository,
                                   PasswordEncoder passwordEncoder,
                                   ObjectMapper objectMapper,
                                   @Value("${app.email.resend-api-key:}") String resendApiKey,
                                   @Value("${app.email.from:}") String mailFrom,
                                   @Value("${app.frontend-url:https://medplus360.netlify.app}") String frontendUrl) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
        this.resendApiKey = resendApiKey;
        this.mailFrom = mailFrom;
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    }

    public void requestReset(String email) {
        if (resendApiKey.isBlank() || mailFrom.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Password recovery email is not configured. Set RESEND_API_KEY and MAIL_FROM on the backend deployment.");
        }

        User user = userRepository.findByEmailIgnoreCase(email.trim()).orElse(null);
        if (user == null) return;

        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
        tokenRepository.deleteByUserId(user.getId());

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUserId(user.getId());
        resetToken.setTokenHash(sha256(rawToken));
        resetToken.setExpiresAt(Instant.now().plus(TOKEN_LIFETIME));
        tokenRepository.save(resetToken);

        String link = frontendUrl + "/reset-password?token=" + rawToken;
        try {
            sendEmail(user.getEmail(), user.getFullName(), link);
        } catch (RuntimeException ex) {
            tokenRepository.delete(resetToken);
            throw ex;
        }
    }

    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = tokenRepository
                .findByTokenHashAndExpiresAtAfter(sha256(request.getToken()), Instant.now())
                .orElseThrow(() -> new BadRequestException("This password reset link is invalid or has expired. Request a new one."));
        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new BadRequestException("This password reset link is invalid or has expired. Request a new one."));
        user.setHashedPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        tokenRepository.deleteByUserId(user.getId());
    }

    private void sendEmail(String to, String name, String link) {
        String greeting = name == null || name.isBlank() ? "there" : escapeHtml(name);
        Map<String, Object> body = Map.of(
                "from", mailFrom,
                "to", new String[]{to},
                "subject", "Reset your MediCare360 password",
                "text", "Hello " + (name == null || name.isBlank() ? "" : name + ", ") +
                        "use this link within 30 minutes to reset your password: " + link +
                        "\nIf you did not request this, you can ignore this email.",
                "html", "<p>Hello " + greeting + ",</p><p>Use the secure link below within 30 minutes to reset your MediCare360 password.</p>" +
                        "<p><a href=\"" + link + "\">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>"
        );
        try {
            String json = objectMapper.writeValueAsString(body);
            java.net.http.HttpRequest httpRequest = java.net.http.HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .timeout(Duration.ofSeconds(15))
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .POST(BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                    .build();
            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                        "The email provider could not send the reset link. Check the sender configuration and try again.");
            }
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Could not send the password reset email. Try again later.");
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Could not send the password reset email. Try again later.");
        }
    }

    private String sha256(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is unavailable", ex);
        }
    }

    private String escapeHtml(String value) {
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&#39;");
    }
}
