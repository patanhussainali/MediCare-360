package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class DoctorResponse {

    private String id;

    private String doctorId;

    private String userId;

    private String userCode;

    private String fullName;

    private String specialization;

    private String qualification;

    private int experienceYears;

    private double consultationFee;

    private String availableDays;

    private String phone;

    private String email;

    private String status;

    private String departmentId;

    private String departmentName;

    private Instant createdAt;

    private Instant updatedAt;
}
