package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class NurseResponse {

    private String id;

    private String nurseId;

    private String userId;

    private String fullName;

    private String departmentId;

    private String shift;

    private String phone;

    private String email;

    private String status;

    private String licenseNumber;

    private Instant createdAt;

    private Instant updatedAt;
}

