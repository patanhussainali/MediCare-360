package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class DoctorResponse {

    private Long id;

    private String doctorId;

    private Long userId;

    private String fullName;

    private String specialization;

    private String qualification;

    private int experienceYears;

    private double consultationFee;

    private String availableDays;

    private String phone;

    private String email;

    private String status;

    private Long departmentId;

    private String departmentName;

    private Instant createdAt;

    private Instant updatedAt;
}
