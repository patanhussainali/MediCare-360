package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class PharmacistResponse {

    private Long id;

    private String pharmacistId;

    private Long userId;

    private String fullName;

    private String licenseNumber;

    private String phone;

    private String email;

    private String status;

    private Instant createdAt;

    private Instant updatedAt;
}

