package com.medicare360.repository;

import com.medicare360.entity.PasswordResetToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.Optional;

public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetToken, String> {
    Optional<PasswordResetToken> findByTokenHashAndExpiresAtAfter(String tokenHash, Instant now);
    void deleteByUserId(String userId);
}
