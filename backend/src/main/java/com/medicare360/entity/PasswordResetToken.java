package com.medicare360.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "password_reset_tokens")
@Getter
@Setter
@NoArgsConstructor
public class PasswordResetToken {
    @Id
    private String id;

    @Indexed(unique = true)
    private String tokenHash;

    @Indexed
    private String userId;

    @Indexed(expireAfterSeconds = 0)
    private Instant expiresAt;
}
