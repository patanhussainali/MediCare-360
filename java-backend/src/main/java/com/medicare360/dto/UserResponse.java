package com.medicare360.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class UserResponse {

    private Long id;

    private String email;

    private String fullName;

    private String role;

    private String phone;

    @JsonProperty("is_active")
    private boolean isActive;

    @JsonProperty("is_verified")
    private boolean isVerified;

    private Instant lastLogin;

    private String profileId;

    private String department;

    private Instant createdAt;

    private Instant updatedAt;
}
