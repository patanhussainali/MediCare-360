package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class PatientResponse {

    private String id;
    private String patientId;
    private String userId;
    private String userCode;
    private String fullName;
    private String gender;
    private String dateOfBirth;
    private String bloodGroup;
    private String phone;
    private String email;
    private String address;
    private String emergencyContact;
    private String allergies;
    private String chronicConditions;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
}
